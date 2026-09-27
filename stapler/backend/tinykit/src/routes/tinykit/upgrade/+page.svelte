<script lang="ts">
  import { goto } from '$app/navigation'
  import { ArrowLeft, Globe, Loader2, Sparkles } from 'lucide-svelte'
  import { pb } from '$lib/pocketbase.svelte'

  let url = $state('')
  let isProcessing = $state(false)
  let status = $state('')
  let error = $state<string | null>(null)

  async function handleUpgrade() {
    if (!url.trim()) return

    isProcessing = true
    error = null
    status = 'Scraping website...'

    try {
      const res = await fetch('/api/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({ url: url.trim() })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upgrade failed')
      }

      status = 'Pipeline complete! Redirecting to studio...'

      // Create a new project with the result
      const projectRes = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pb.authStore.token}`
        },
        body: JSON.stringify({
          name: `Upgraded: ${new URL(url).hostname}`,
          domain: `upgraded-${Date.now()}.local`
        })
      })

      const project = await projectRes.json()

      if (project.id) {
        // Store the pipeline results for the developer to use
        await fetch(`/api/projects/${project.id}/agent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${pb.authStore.token}`
          },
          body: JSON.stringify({
            prompt: `Apply these upgrades to the project:\n\n## Strategy:\n${data.strategy}\n\n## Design Plan:\n${data.design}\n\n## Developer Output:\n${data.developer}`
          })
        })

        goto(`/tinykit/studio?id=${project.id}`)
      }
    } catch (err: any) {
      error = err.message || 'Something went wrong'
    } finally {
      isProcessing = false
    }
  }
</script>

<svelte:head>
  <title>Upgrade Website - TinyKit</title>
</svelte:head>

<div class="min-h-screen bg-[var(--builder-bg-primary)] safe-area-top">
  <!-- Header -->
  <header class="border-b border-[var(--builder-border)] px-6 py-4">
    <div class="max-w-2xl mx-auto flex items-center gap-4">
      <a
        href="/tinykit"
        class="p-2 -ml-2 text-[var(--builder-text-secondary)] hover:text-[var(--builder-text-primary)] transition-colors"
      >
        <ArrowLeft class="w-5 h-5" />
      </a>
      <span class="text-xl font-semibold text-[var(--builder-text-primary)]">
        Upgrade Website
      </span>
    </div>
  </header>

  <!-- Main content -->
  <main class="max-w-2xl mx-auto px-6 py-12">
    <div class="space-y-8">
      <!-- Hero -->
      <div class="text-center space-y-4">
        <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--builder-accent)]/10">
          <Sparkles class="w-8 h-8 text-[var(--builder-accent)]" />
        </div>
        <h1 class="text-2xl font-bold text-[var(--builder-text-primary)]">
          Transform any website
        </h1>
        <p class="text-[var(--builder-text-secondary)]">
          Enter a URL and our AI pipeline will analyze, redesign, and rebuild it using TinyKit
        </p>
      </div>

      <!-- URL Input -->
      <div class="bg-[var(--builder-bg-secondary)] border border-[var(--builder-border)] rounded-lg p-6 space-y-4">
        <label for="url" class="block text-sm font-medium text-[var(--builder-text-secondary)]">
          Website URL
        </label>
        <div class="flex gap-3">
          <div class="relative flex-1">
            <Globe class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--builder-text-muted)]" />
            <input
              id="url"
              type="url"
              bind:value={url}
              placeholder="https://example.com"
              disabled={isProcessing}
              class="w-full pl-10 pr-4 py-3 bg-[var(--builder-bg-tertiary)] border border-[var(--builder-border)] rounded-lg text-[var(--builder-text-primary)] placeholder:text-[var(--builder-text-muted)] focus:outline-none focus:border-[var(--builder-accent)] disabled:opacity-50"
            />
          </div>
          <button
            onclick={handleUpgrade}
            disabled={!url.trim() || isProcessing}
            class="px-6 py-3 bg-[var(--builder-accent)] text-white rounded-lg hover:bg-[var(--builder-accent-hover)] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {#if isProcessing}
              <Loader2 class="w-5 h-5 animate-spin" />
              Processing...
            {:else}
              <Sparkles class="w-5 h-5" />
              Upgrade
            {/if}
          </button>
        </div>
      </div>

      <!-- Status -->
      {#if status}
        <div class="px-4 py-3 bg-[var(--builder-accent)]/10 border border-[var(--builder-accent)]/30 rounded-lg text-[var(--builder-accent)] text-sm">
          {status}
        </div>
      {/if}

      <!-- Error -->
      {#if error}
        <div class="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      {/if}

      <!-- How it works -->
      <div class="bg-[var(--builder-bg-secondary)] border border-[var(--builder-border)] rounded-lg p-6">
        <h2 class="text-sm font-medium text-[var(--builder-text-primary)] mb-4">
          How it works
        </h2>
        <ol class="space-y-3 text-sm text-[var(--builder-text-secondary)]">
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--builder-accent)]/10 text-[var(--builder-accent)] flex items-center justify-center text-xs font-medium">1</span>
            <span><strong class="text-[var(--builder-text-primary)]">Strategist</strong> analyzes the website and creates a marketing strategy</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--builder-accent)]/10 text-[var(--builder-accent)] flex items-center justify-center text-xs font-medium">2</span>
            <span><strong class="text-[var(--builder-text-primary)]">Designer</strong> creates a UI/UX redesign plan with CSS variables</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--builder-accent)]/10 text-[var(--builder-accent)] flex items-center justify-center text-xs font-medium">3</span>
            <span><strong class="text-[var(--builder-text-primary)]">Developer</strong> builds the Svelte 5 app in TinyKit</span>
          </li>
          <li class="flex gap-3">
            <span class="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--builder-accent)]/10 text-[var(--builder-accent)] flex items-center justify-center text-xs font-medium">4</span>
            <span><strong class="text-[var(--builder-text-primary)]">QA</strong> reviews and approves the code</span>
          </li>
        </ol>
      </div>
    </div>
  </main>
</div>
