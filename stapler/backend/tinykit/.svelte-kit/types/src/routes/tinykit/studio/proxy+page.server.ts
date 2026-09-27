// @ts-nocheck
import type { PageServerLoad } from './$types'

export const load = async ({ url, locals }: Parameters<PageServerLoad>[0]) => {
	const project_id = url.searchParams.get('id')
	const domain = locals.domain

	// Pass the project ID or domain to the client
	// The client will handle loading and validation with user auth
	return {
		project_id: project_id || null,
		domain
	}
}
