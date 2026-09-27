import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { svelte } from 'codemirror-lang-svelte'
import { abbreviationTracker, expandAbbreviation } from '@emmetio/codemirror6-plugin'
import { keymap } from '@codemirror/view'
import { autocompletion, type CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { syntaxTree } from '@codemirror/language'

// $data collection method signatures
const DATA_COLLECTION_METHODS = [
	{ label: 'list', type: 'method', detail: '(params?) → Promise<Record[]>', info: 'Fetch all records, optionally filtered/sorted' },
	{ label: 'get', type: 'method', detail: '(id, params?) → Promise<Record>', info: 'Fetch a single record by ID' },
	{ label: 'create', type: 'method', detail: '(data) → Promise<Record>', info: 'Create a new record' },
	{ label: 'update', type: 'method', detail: '(id, data) → Promise<Record>', info: 'Update an existing record' },
	{ label: 'delete', type: 'method', detail: '(id) → Promise<boolean>', info: 'Delete a record by ID' },
	{ label: 'subscribe', type: 'method', detail: '(callback, params?) → unsubscribe', info: 'Subscribe to realtime updates' }
]

// Content field type info
const CONTENT_TYPE_INFO: Record<string, string> = {
	text: 'string',
	textarea: 'string',
	markdown: 'string (HTML)',
	number: 'number',
	boolean: 'boolean',
	json: 'object',
	image: 'string (URL)'
}

/**
 * Find the variable name used for `import X from 'module_path'`
 * by walking the syntax tree
 */
function find_import_name(context: CompletionContext, module_path: string): string | null {
	const tree = syntaxTree(context.state)
	let import_name: string | null = null

	// Walk the tree looking for import declarations
	tree.iterate({
		enter(node) {
			// Look for ImportDeclaration nodes
			if (node.name === 'ImportDeclaration') {
				const decl_text = context.state.sliceDoc(node.from, node.to)

				// Check if this imports from the specified module
				if (decl_text.includes(`'${module_path}'`) || decl_text.includes(`"${module_path}"`)) {
					// Extract the imported name: import NAME from 'module'
					const match = decl_text.match(/import\s+(\w+)\s+from/)
					if (match) {
						import_name = match[1]
						return false // Stop iteration
					}
				}
			}
		}
	})

	return import_name
}

/**
 * Find the variable name used for `import X from '$data'`
 */
function find_data_import_name(context: CompletionContext): string | null {
	return find_import_name(context, '$data')
}

/**
 * Find the variable name used for `import X from '$content'`
 */
function find_content_import_name(context: CompletionContext): string | null {
	return find_import_name(context, '$content')
}

/**
 * Content field type for autocomplete
 */
export type ContentFieldInfo = {
	key: string
	type: string
}

/**
 * Create a completion source for $data module
 */
function create_data_completion_source(collections: string[]) {
	return (context: CompletionContext): CompletionResult | null => {
		// Find what variable name is used for the $data import
		const data_var = find_data_import_name(context)
		if (!data_var) return null

		// Match patterns like: db. or db.tasks. or db.tasks.li
		const pattern = new RegExp(`\\b${data_var}\\.(\\w*\\.?\\w*)$`)
		const before = context.matchBefore(pattern)
		if (!before) return null

		// Extract what's after "db."
		const prefix_len = data_var.length + 1
		const text = before.text.slice(before.text.indexOf(data_var) + prefix_len)
		const parts = text.split('.')

		// After "db." - suggest collection names
		if (parts.length === 1) {
			return {
				from: before.from + prefix_len,
				options: collections.map(name => ({
					label: name,
					type: 'variable',
					detail: 'collection'
				})),
				validFor: /^\w*$/
			}
		}

		// After "db.tasks." - suggest methods
		if (parts.length === 2 && collections.includes(parts[0])) {
			return {
				from: before.from + prefix_len + parts[0].length + 1,
				options: DATA_COLLECTION_METHODS,
				validFor: /^\w*$/
			}
		}

		return null
	}
}

/**
 * Create a completion source for $content module
 */
function create_content_completion_source(fields: ContentFieldInfo[]) {
	return (context: CompletionContext): CompletionResult | null => {
		// Find what variable name is used for the $content import
		const content_var = find_content_import_name(context)
		if (!content_var) return null

		// Match patterns like: content. or content.hero_
		const pattern = new RegExp(`\\b${content_var}\\.(\\w*)$`)
		const before = context.matchBefore(pattern)
		if (!before) return null

		// Extract what's after "content."
		const prefix_len = content_var.length + 1

		// Suggest content field keys
		return {
			from: before.from + prefix_len,
			options: fields.map(field => ({
				label: field.key,
				type: 'property',
				detail: CONTENT_TYPE_INFO[field.type] || field.type
			})),
			validFor: /^\w*$/
		}
	}
}

/**
 * Create combined autocomplete extension for $data and $content modules
 */
export function create_tinykit_completions(collections: string[], content_fields: ContentFieldInfo[]) {
	return autocompletion({
		override: [
			create_data_completion_source(collections),
			create_content_completion_source(content_fields)
		]
	})
}

export function getLanguage(mode: string) {
	return {
		svelte: svelte(),
		html: svelte(),
		css: css(),
		javascript: javascript(),
		typescript: javascript({ typescript: true }),
		json: javascript()
	}[mode] || svelte()
}

export function getEmmetExtensions(mode: string) {
	// Emmet only for HTML-like modes (Svelte templates)
	const emmet_modes = ['svelte', 'html']
	if (!emmet_modes.includes(mode)) {
		return []
	}

	return [
		// Disable preview popup - it gets confused in mixed JS/HTML/CSS files
		// Tab expansion still works
		abbreviationTracker({ previewEnabled: false }),
		keymap.of([{
			key: 'Tab',
			run: expandAbbreviation
		}])
	]
}
