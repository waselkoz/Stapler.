import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getLLMSettings, validateUserToken, unauthorizedResponse } from '$lib/server/pb'
import { env } from '$env/dynamic/private'

// GET /api/settings/llm-status - Check if LLM is configured
export const GET: RequestHandler = async ({ request }) => {
	const user = await validateUserToken(request)
	if (!user) {
		return unauthorizedResponse('Authentication required')
	}

	// Check DB settings first, then fall back to env vars
	const db_settings = await getLLMSettings()
	const has_db_key = !!(db_settings?.api_key)
	const has_env_key = !!(env.LLM_API_KEY)

	return json({
		configured: has_db_key || has_env_key,
		source: has_db_key ? 'settings' : has_env_key ? 'env' : null
	})
}
