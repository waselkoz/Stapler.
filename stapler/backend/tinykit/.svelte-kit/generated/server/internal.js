
import root from '../root.js';
import { set_building, set_prerendering } from '__sveltekit/environment';
import { set_assets } from '$app/paths/internal/server';
import { set_manifest, set_read_implementation } from '__sveltekit/server';
import { set_private_env, set_public_env } from '../../../node_modules/@sveltejs/kit/src/runtime/shared-server.js';

export const options = {
	app_template_contains_nonce: false,
	async: false,
	csp: {"mode":"auto","directives":{"upgrade-insecure-requests":false,"block-all-mixed-content":false},"reportOnly":{"upgrade-insecure-requests":false,"block-all-mixed-content":false}},
	csrf_check_origin: true,
	csrf_trusted_origins: [],
	embedded: false,
	env_public_prefix: 'PUBLIC_',
	env_private_prefix: '',
	hash_routing: false,
	hooks: null, // added lazily, via `get_hooks`
	preload_strategy: "modulepreload",
	root,
	service_worker: false,
	service_worker_options: undefined,
	templates: {
		app: ({ head, body, assets, nonce, env }) => "<!doctype html>\r\n<html lang=\"en\">\r\n\r\n<head>\r\n\t<meta charset=\"utf-8\" />\r\n\t<link rel=\"icon\" href=\"" + assets + "/favicon.png\" />\r\n\t<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\" />\r\n\t<script src=\"https://code.iconify.design/iconify-icon/2.1.0/iconify-icon.min.js\"></script>\r\n\t<script>\r\n\t\t// Load theme immediately to prevent flash\r\n\t\t(function () {\r\n\t\t\tconst themes = {\r\n\t\t\t\t'tinykit': { bg_primary: '#0d0d0d', bg_secondary: '#1e1e1e', bg_tertiary: '#2a2a2a', accent: '#22c55e', text_primary: '#ffffff', text_secondary: '#999999', border: '#2a2a2a' },\r\n\t\t\t\t'ocean': { bg_primary: '#0f172a', bg_secondary: '#1e293b', bg_tertiary: '#334155', accent: '#0ea5e9', text_primary: '#f1f5f9', text_secondary: '#94a3b8', border: '#334155' },\r\n\t\t\t\t'forest': { bg_primary: '#18181b', bg_secondary: '#27272a', bg_tertiary: '#3f3f46', accent: '#10b981', text_primary: '#fafafa', text_secondary: '#a1a1aa', border: '#3f3f46' },\r\n\t\t\t\t'sunset': { bg_primary: '#1c1917', bg_secondary: '#292524', bg_tertiary: '#44403c', accent: '#f97316', text_primary: '#fafaf9', text_secondary: '#a8a29e', border: '#44403c' },\r\n\t\t\t\t'nord': { bg_primary: '#2e3440', bg_secondary: '#3b4252', bg_tertiary: '#434c5e', accent: '#88c0d0', text_primary: '#eceff4', text_secondary: '#d8dee9', border: '#434c5e' },\r\n\t\t\t\t'dracula': { bg_primary: '#282a36', bg_secondary: '#44475a', bg_tertiary: '#6272a4', accent: '#ff79c6', text_primary: '#f8f8f2', text_secondary: '#a0a0a0', border: '#44475a' },\r\n\t\t\t\t'tokyo': { bg_primary: '#1a1b26', bg_secondary: '#24283b', bg_tertiary: '#414868', accent: '#7aa2f7', text_primary: '#c0caf5', text_secondary: '#9aa5ce', border: '#414868' },\r\n\t\t\t\t'light': { bg_primary: '#ffffff', bg_secondary: '#f8fafc', bg_tertiary: '#e2e8f0', accent: '#3b82f6', text_primary: '#0f172a', text_secondary: '#64748b', border: '#e2e8f0' },\r\n\t\t\t\t'monokai': { bg_primary: '#272822', bg_secondary: '#3e3d32', bg_tertiary: '#49483e', accent: '#f92672', text_primary: '#f8f8f2', text_secondary: '#75715e', border: '#49483e' },\r\n\t\t\t\t'gruvbox': { bg_primary: '#282828', bg_secondary: '#3c3836', bg_tertiary: '#504945', accent: '#fe8019', text_primary: '#ebdbb2', text_secondary: '#a89984', border: '#504945' },\r\n\t\t\t\t'solarized': { bg_primary: '#002b36', bg_secondary: '#073642', bg_tertiary: '#586e75', accent: '#268bd2', text_primary: '#fdf6e3', text_secondary: '#93a1a1', border: '#073642' },\r\n\t\t\t\t'material': { bg_primary: '#263238', bg_secondary: '#37474f', bg_tertiary: '#455a64', accent: '#80cbc4', text_primary: '#eceff1', text_secondary: '#b0bec5', border: '#37474f' },\r\n\t\t\t\t'ayu': { bg_primary: '#0a0e14', bg_secondary: '#0d1017', bg_tertiary: '#1f2430', accent: '#ffb454', text_primary: '#b3b1ad', text_secondary: '#626a73', border: '#1f2430' },\r\n\t\t\t\t'onedark': { bg_primary: '#282c34', bg_secondary: '#21252b', bg_tertiary: '#383e4a', accent: '#61afef', text_primary: '#abb2bf', text_secondary: '#5c6370', border: '#383e4a' },\r\n\t\t\t\t'catppuccin': { bg_primary: '#1e1e2e', bg_secondary: '#181825', bg_tertiary: '#313244', accent: '#f5c2e7', text_primary: '#cdd6f4', text_secondary: '#6c7086', border: '#313244' },\r\n\t\t\t\t'rosepine': { bg_primary: '#191724', bg_secondary: '#1f1d2e', bg_tertiary: '#26233a', accent: '#ebbcba', text_primary: '#e0def4', text_secondary: '#908caa', border: '#26233a' },\r\n\t\t\t\t'midnight': { bg_primary: '#0c0f14', bg_secondary: '#141820', bg_tertiary: '#1c222d', accent: '#d4a574', text_primary: '#e8e4df', text_secondary: '#8a8a8a', border: '#252b38' },\r\n\t\t\t\t'aurora': { bg_primary: '#080b10', bg_secondary: '#0e1219', bg_tertiary: '#161c26', accent: '#56d4bc', text_primary: '#d4dae4', text_secondary: '#6b7a8f', border: '#1e2633' },\r\n\t\t\t\t'ember': { bg_primary: '#151010', bg_secondary: '#1e1717', bg_tertiary: '#2a2121', accent: '#e07850', text_primary: '#ede8e6', text_secondary: '#9a8f8c', border: '#362c2c' },\r\n\t\t\t\t'slate': { bg_primary: '#1a1d23', bg_secondary: '#22262e', bg_tertiary: '#2c323c', accent: '#5eb3d5', text_primary: '#e2e6ec', text_secondary: '#8892a2', border: '#363d4a' }\r\n\t\t\t}\r\n\t\t\tconst savedId = localStorage.getItem('builder-theme') || 'tinykit'\r\n\t\t\tconst theme = themes[savedId] || themes['tinykit']\r\n\t\t\tconst root = document.documentElement\r\n\t\t\troot.style.setProperty('--builder-bg-primary', theme.bg_primary)\r\n\t\t\troot.style.setProperty('--builder-bg-secondary', theme.bg_secondary)\r\n\t\t\troot.style.setProperty('--builder-bg-tertiary', theme.bg_tertiary)\r\n\t\t\troot.style.setProperty('--builder-accent', theme.accent)\r\n\t\t\troot.style.setProperty('--builder-text-primary', theme.text_primary)\r\n\t\t\troot.style.setProperty('--builder-text-secondary', theme.text_secondary)\r\n\t\t\troot.style.setProperty('--builder-border', theme.border)\r\n\t\t})()\r\n\t</script>\r\n\t" + head + "\r\n</head>\r\n\r\n<body data-sveltekit-preload-data=\"hover\">\r\n\t<div style=\"display: contents\">" + body + "</div>\r\n</body>\r\n\r\n</html>",
		error: ({ status, message }) => "<!doctype html>\n<html lang=\"en\">\n\t<head>\n\t\t<meta charset=\"utf-8\" />\n\t\t<title>" + message + "</title>\n\n\t\t<style>\n\t\t\tbody {\n\t\t\t\t--bg: white;\n\t\t\t\t--fg: #222;\n\t\t\t\t--divider: #ccc;\n\t\t\t\tbackground: var(--bg);\n\t\t\t\tcolor: var(--fg);\n\t\t\t\tfont-family:\n\t\t\t\t\tsystem-ui,\n\t\t\t\t\t-apple-system,\n\t\t\t\t\tBlinkMacSystemFont,\n\t\t\t\t\t'Segoe UI',\n\t\t\t\t\tRoboto,\n\t\t\t\t\tOxygen,\n\t\t\t\t\tUbuntu,\n\t\t\t\t\tCantarell,\n\t\t\t\t\t'Open Sans',\n\t\t\t\t\t'Helvetica Neue',\n\t\t\t\t\tsans-serif;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tjustify-content: center;\n\t\t\t\theight: 100vh;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t.error {\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t\tmax-width: 32rem;\n\t\t\t\tmargin: 0 1rem;\n\t\t\t}\n\n\t\t\t.status {\n\t\t\t\tfont-weight: 200;\n\t\t\t\tfont-size: 3rem;\n\t\t\t\tline-height: 1;\n\t\t\t\tposition: relative;\n\t\t\t\ttop: -0.05rem;\n\t\t\t}\n\n\t\t\t.message {\n\t\t\t\tborder-left: 1px solid var(--divider);\n\t\t\t\tpadding: 0 0 0 1rem;\n\t\t\t\tmargin: 0 0 0 1rem;\n\t\t\t\tmin-height: 2.5rem;\n\t\t\t\tdisplay: flex;\n\t\t\t\talign-items: center;\n\t\t\t}\n\n\t\t\t.message h1 {\n\t\t\t\tfont-weight: 400;\n\t\t\t\tfont-size: 1em;\n\t\t\t\tmargin: 0;\n\t\t\t}\n\n\t\t\t@media (prefers-color-scheme: dark) {\n\t\t\t\tbody {\n\t\t\t\t\t--bg: #222;\n\t\t\t\t\t--fg: #ddd;\n\t\t\t\t\t--divider: #666;\n\t\t\t\t}\n\t\t\t}\n\t\t</style>\n\t</head>\n\t<body>\n\t\t<div class=\"error\">\n\t\t\t<span class=\"status\">" + status + "</span>\n\t\t\t<div class=\"message\">\n\t\t\t\t<h1>" + message + "</h1>\n\t\t\t</div>\n\t\t</div>\n\t</body>\n</html>\n"
	},
	version_hash: "eeyjf9"
};

export async function get_hooks() {
	let handle;
	let handleFetch;
	let handleError;
	let handleValidationError;
	let init;
	({ handle, handleFetch, handleError, handleValidationError, init } = await import("../../../src/hooks.server.ts"));

	let reroute;
	let transport;
	

	return {
		handle,
		handleFetch,
		handleError,
		handleValidationError,
		init,
		reroute,
		transport
	};
}

export { set_assets, set_building, set_manifest, set_prerendering, set_private_env, set_public_env, set_read_implementation };
