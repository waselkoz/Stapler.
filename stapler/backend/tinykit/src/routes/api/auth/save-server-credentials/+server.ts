import { json } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import PocketBase from 'pocketbase'
import * as fs from 'fs/promises'

const PB_URL = process.env.POCKETBASE_URL || 'http://127.0.0.1:8091'
const SETUP_FILE = './pocketbase/pb_data/.setup_complete'

/**
 * Save server credentials after user login
 * This allows the server to re-authenticate when tokens expire
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json()

		if (!email || !password) {
			return json({ error: 'Email and password required' }, { status: 400 })
		}

		// Verify credentials work with PocketBase superusers
		const pb = new PocketBase(PB_URL)
		try {
			await pb.collection('_superusers').authWithPassword(email, password)
		} catch (e: any) {
			// Not a superuser or wrong password - that's fine, they might just be a regular user
			// Only superusers can save server credentials
			return json({ ok: true, saved: false })
		}

		// Credentials are valid for superuser - save them
		try {
			let setup: any = {}

			// Try to read existing setup file
			try {
				const data = await fs.readFile(SETUP_FILE, 'utf-8')
				setup = JSON.parse(data)
			} catch {
				// File doesn't exist or invalid - start fresh
			}

			// Update with new credentials
			setup.admin_email = email
			setup.admin_password = password
			setup.auth_token = pb.authStore.token
			setup.timestamp = new Date().toISOString()

			await fs.writeFile(SETUP_FILE, JSON.stringify(setup), { mode: 0o600 })

			return json({ ok: true, saved: true })
		} catch (e: any) {
			console.error('[Auth] Failed to save server credentials:', e.message)
			return json({ ok: true, saved: false })
		}
	} catch (e: any) {
		console.error('[Auth] Error:', e.message)
		return json({ error: 'Failed to process request' }, { status: 500 })
	}
}
