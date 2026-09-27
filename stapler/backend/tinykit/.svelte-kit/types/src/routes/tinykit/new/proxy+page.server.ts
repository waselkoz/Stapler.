// @ts-nocheck
import type { PageServerLoad } from './$types'

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
	// Get domain from query param or from current request domain
	const domain = url.searchParams.get('domain') || locals.domain
	return { domain }
}
