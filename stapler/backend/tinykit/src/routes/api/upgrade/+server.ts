import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { env } from '$env/dynamic/private'
import { getProject, updateProject, getLLMSettings, validateUserToken, unauthorizedResponse } from '$lib/server/pb'

const OPENCODE_URL = env.OPENCODE_BASE_URL || 'http://127.0.0.1:4096'

interface UpgradeRequest {
  url: string
  project_id?: string
}

async function scrapeUrl(url: string): Promise<{ html: string; error?: string }> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TinyKit/1.0)' }
    })
    if (!res.ok) return { html: '', error: `Failed to fetch: ${res.status}` }
    const html = await res.text()
    return { html: html.slice(0, 50000) } // Cap at 50KB
  } catch (err: any) {
    return { html: '', error: err.message || 'Failed to scrape URL' }
  }
}

async function runOpenCodeAgent(
  title: string,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // Create session
  const sessionRes = await fetch(`${OPENCODE_URL}/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title })
  })
  const session = await sessionRes.json()

  // Send message
  const fullPrompt = `${systemPrompt}\n\n---\n\n${userPrompt}`
  const msgRes = await fetch(`${OPENCODE_URL}/session/${session.id}/message`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: { providerID: 'opencode', modelID: 'big-pickle' },
      parts: [{ type: 'text', text: fullPrompt }]
    })
  })
  const msg = await msgRes.json()
  const textParts = msg.parts?.filter((p: any) => p.type === 'text').map((p: any) => p.text) || []
  return textParts.join('\n')
}

const STRATEGIST_PROMPT = `You are a Senior Digital Strategist. Analyze this website and output a structured strategy:

## AUDIT SUMMARY
What the business does, current website state, biggest opportunity.

## STRATEGIC ANALYSIS
| Framework | Key Finding | Impact |
| SWOT | [finding] | [High/Med/Low] |

## TOP 3 ACTIONS
1. [Action] - [Expected outcome]
2. [Action] - [Expected outcome]  
3. [Action] - [Expected outcome]

## DESIGN DIRECTION
One sentence: the visual mood and style for the redesign.

RULES: Be specific. Focus on conversion optimization. Reference specific HTML elements.`

const DESIGNER_PROMPT = `You are a UI/UX Design Architect. Based on this strategy, create a design plan:

## COLOR SYSTEM
Define CSS variables:
--primary, --primary-hover, --bg, --surface, --text, --text-muted, --border, --radius

## TYPOGRAPHY  
Font stack and scale (max 3 sizes).

## SPACING
Scale: sm, md, lg, xl

## COMPONENT REDESIGN
For key components:
- Selector
- Current issues
- New CSS properties
- Rationale

RULES: Every CSS value must be specific. Use rem for typography, px for borders.`

const DEVELOPER_PROMPT = `You are a Frontend Engineer. Generate complete Svelte 5 code using TinyKit's tools.

RESPONSE FORMAT - Call these tools in order:
1. write_code - Complete Svelte 5 app with embedded CSS using var() for ALL colors/fonts/spacing
2. create_design_field - For each CSS variable (--primary, --bg, etc.)
3. create_content_field - For editable text content

CSS REQUIREMENTS:
- Use var(--name, fallback) for ALL values
- Mobile-first responsive
- Smooth transitions
- Semantic HTML5

SVELTE 5 RULES:
- let count = $state(0)
- onclick={handler} not on:click
- $derived() for computed values`

const QA_PROMPT = `You are a QA Engineer. Review this code against the design plan.

Output ONLY:
## VERDICT: APPROVED
If code passes ALL checks.

## VERDICT: FAILED  
List EVERY failure with fix needed.

CHECKS:
1. CSS variables used for all colors/fonts/spacing
2. Responsive design (mobile/tablet/desktop)
3. Semantic HTML (header/main/section/footer)
4. Content is editable via content fields
5. Design fields created for all CSS variables
6. No hardcoded colors or fonts`

// POST /api/upgrade - Input a URL, run the agent pipeline
export const POST: RequestHandler = async ({ request }) => {
  const user = await validateUserToken(request)
  if (!user) return unauthorizedResponse('Authentication required')

  try {
    const { url, project_id } = await request.json() as UpgradeRequest

    if (!url) {
      return json({ error: 'URL is required' }, { status: 400 })
    }

    // Scrape the URL
    const { html, error: scrapeError } = await scrapeUrl(url)
    if (scrapeError) {
      return json({ error: scrapeError }, { status: 400 })
    }

    // Step 1: Strategist
    const strategy = await runOpenCodeAgent(
      'Strategist',
      STRATEGIST_PROMPT,
      `Analyze this website and propose a premium redesign:\n\nURL: ${url}\n\nHTML:\n${html.slice(0, 10000)}`
    )

    // Step 2: Designer
    const design = await runOpenCodeAgent(
      'Designer',
      DESIGNER_PROMPT,
      `Based on this marketing strategy:\n${strategy}\n\nDesign a premium UI based on the HTML:\n${html.slice(0, 10000)}`
    )

    // Step 3: Developer - outputs tool calls for TinyKit
    const devResponse = await runOpenCodeAgent(
      'Developer',
      DEVELOPER_PROMPT,
      `Based on this design plan:\n${design}\n\nGenerate the Svelte 5 code and call write_code, create_design_field, and create_content_field tools.\n\nOriginal HTML:\n${html.slice(0, 10000)}`
    )

    // Step 4: QA
    let qaFeedback = await runOpenCodeAgent(
      'QA',
      QA_PROMPT,
      `Review this code against the design plan:\n\nDesign Plan:\n${design}\n\nCode Response:\n${devResponse}`
    )

    // If QA fails, retry once
    if (qaFeedback.includes('VERDICT: FAILED')) {
      const fixResponse = await runOpenCodeAgent(
        'Developer (Fix)',
        DEVELOPER_PROMPT,
        `The QA agent found issues:\n${qaFeedback}\n\nPlease fix the code and call the tools again.\n\nOriginal HTML:\n${html.slice(0, 10000)}`
      )
      
      qaFeedback = await runOpenCodeAgent(
        'QA (Re-check)',
        QA_PROMPT,
        `Review this fixed code:\n\nDesign Plan:\n${design}\n\nCode Response:\n${fixResponse}`
      )
    }

    return json({
      strategy,
      design,
      developer: devResponse,
      qa: qaFeedback,
      url
    })

  } catch (err: any) {
    console.error('[Upgrade Pipeline] Error:', err)
    return json({ error: err.message || 'Pipeline failed' }, { status: 500 })
  }
}
