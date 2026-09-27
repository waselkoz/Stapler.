import { marked } from 'marked'

/**
 * Transform content fields array to key-value object for use in templates
 * - Converts image filenames to full asset URLs
 * - Converts markdown to HTML
 */
export function transform_content_fields(
	fields: Array<{ name: string; type: string; value: any }>,
	project_id: string
): Record<string, any> {
	const slugify = (text: string) =>
		text
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '_')
			.replace(/^_|_$/g, '')

	const obj: Record<string, any> = {}
	for (const field of fields) {
		const key = slugify(field.name)
		let value = field.value
		// Convert image filenames to full URLs (skip external URLs)
		if (field.type === 'image' && value && !value.startsWith('http://') && !value.startsWith('https://')) {
			value = `/_tk/assets/${project_id}/${value}`
		}
		// Convert markdown to HTML
		if (field.type === 'markdown' && value) {
			value = marked.parse(value)
		}
		obj[key] = value
	}
	return obj
}
