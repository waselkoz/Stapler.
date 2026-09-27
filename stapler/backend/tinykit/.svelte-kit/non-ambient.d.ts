
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	export interface AppTypes {
		RouteId(): "/" | "/_tk" | "/_tk/assets" | "/_tk/assets/[project_id]" | "/_tk/assets/[filename]" | "/_tk/assets/[project_id]/[filename]" | "/_tk/data" | "/_tk/data/[project_id]" | "/_tk/data/[project_id]/[collection]" | "/_tk/data/[project_id]/[collection]/[id]" | "/_tk/realtime" | "/_tk/realtime/[project_id]" | "/api" | "/api/agent" | "/api/agent/clear" | "/api/agent/test" | "/api/auth" | "/api/auth/save-server-credentials" | "/api/domains" | "/api/migrate-build-fields" | "/api/projects" | "/api/projects/[id]" | "/api/projects/[id]/agent" | "/api/projects/[id]/build" | "/api/projects/[id]/export" | "/api/projects/[id]/templates" | "/api/proxy" | "/api/settings" | "/api/settings/llm-status" | "/api/settings/validate-llm" | "/api/setup" | "/api/templates" | "/api/templates/[id]" | "/api/upgrade" | "/login" | "/setup" | "/tinykit" | "/tinykit/components" | "/tinykit/dashboard" | "/tinykit/dashboard/components" | "/tinykit/lib" | "/tinykit/new-kit" | "/tinykit/new" | "/tinykit/preview" | "/tinykit/preview/[id]" | "/tinykit/preview/[id]/[...path]" | "/tinykit/settings" | "/tinykit/studio" | "/tinykit/studio/components" | "/tinykit/studio/components/vibes" | "/tinykit/studio/panels" | "/tinykit/studio/panels/agent" | "/tinykit/studio/panels/code" | "/tinykit/studio/panels/code/CodeMirror" | "/tinykit/studio/panels/content" | "/tinykit/studio/panels/data" | "/tinykit/studio/panels/design" | "/tinykit/studio/panels/history" | "/tinykit/upgrade" | "/tinykit/[id]" | "/[...path]";
		RouteParams(): {
			"/_tk/assets/[project_id]": { project_id: string };
			"/_tk/assets/[filename]": { filename: string };
			"/_tk/assets/[project_id]/[filename]": { project_id: string; filename: string };
			"/_tk/data/[project_id]": { project_id: string };
			"/_tk/data/[project_id]/[collection]": { project_id: string; collection: string };
			"/_tk/data/[project_id]/[collection]/[id]": { project_id: string; collection: string; id: string };
			"/_tk/realtime/[project_id]": { project_id: string };
			"/api/projects/[id]": { id: string };
			"/api/projects/[id]/agent": { id: string };
			"/api/projects/[id]/build": { id: string };
			"/api/projects/[id]/export": { id: string };
			"/api/projects/[id]/templates": { id: string };
			"/api/templates/[id]": { id: string };
			"/tinykit/preview/[id]": { id: string };
			"/tinykit/preview/[id]/[...path]": { id: string; path: string };
			"/tinykit/[id]": { id: string };
			"/[...path]": { path: string }
		};
		LayoutParams(): {
			"/": { project_id?: string; filename?: string; collection?: string; id?: string; path?: string };
			"/_tk": { project_id?: string; filename?: string; collection?: string; id?: string };
			"/_tk/assets": { project_id?: string; filename?: string };
			"/_tk/assets/[project_id]": { project_id: string; filename?: string };
			"/_tk/assets/[filename]": { filename: string };
			"/_tk/assets/[project_id]/[filename]": { project_id: string; filename: string };
			"/_tk/data": { project_id?: string; collection?: string; id?: string };
			"/_tk/data/[project_id]": { project_id: string; collection?: string; id?: string };
			"/_tk/data/[project_id]/[collection]": { project_id: string; collection: string; id?: string };
			"/_tk/data/[project_id]/[collection]/[id]": { project_id: string; collection: string; id: string };
			"/_tk/realtime": { project_id?: string };
			"/_tk/realtime/[project_id]": { project_id: string };
			"/api": { id?: string };
			"/api/agent": Record<string, never>;
			"/api/agent/clear": Record<string, never>;
			"/api/agent/test": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/api/auth/save-server-credentials": Record<string, never>;
			"/api/domains": Record<string, never>;
			"/api/migrate-build-fields": Record<string, never>;
			"/api/projects": { id?: string };
			"/api/projects/[id]": { id: string };
			"/api/projects/[id]/agent": { id: string };
			"/api/projects/[id]/build": { id: string };
			"/api/projects/[id]/export": { id: string };
			"/api/projects/[id]/templates": { id: string };
			"/api/proxy": Record<string, never>;
			"/api/settings": Record<string, never>;
			"/api/settings/llm-status": Record<string, never>;
			"/api/settings/validate-llm": Record<string, never>;
			"/api/setup": Record<string, never>;
			"/api/templates": { id?: string };
			"/api/templates/[id]": { id: string };
			"/api/upgrade": Record<string, never>;
			"/login": Record<string, never>;
			"/setup": Record<string, never>;
			"/tinykit": { id?: string; path?: string };
			"/tinykit/components": Record<string, never>;
			"/tinykit/dashboard": Record<string, never>;
			"/tinykit/dashboard/components": Record<string, never>;
			"/tinykit/lib": Record<string, never>;
			"/tinykit/new-kit": Record<string, never>;
			"/tinykit/new": Record<string, never>;
			"/tinykit/preview": { id?: string; path?: string };
			"/tinykit/preview/[id]": { id: string; path?: string };
			"/tinykit/preview/[id]/[...path]": { id: string; path: string };
			"/tinykit/settings": Record<string, never>;
			"/tinykit/studio": Record<string, never>;
			"/tinykit/studio/components": Record<string, never>;
			"/tinykit/studio/components/vibes": Record<string, never>;
			"/tinykit/studio/panels": Record<string, never>;
			"/tinykit/studio/panels/agent": Record<string, never>;
			"/tinykit/studio/panels/code": Record<string, never>;
			"/tinykit/studio/panels/code/CodeMirror": Record<string, never>;
			"/tinykit/studio/panels/content": Record<string, never>;
			"/tinykit/studio/panels/data": Record<string, never>;
			"/tinykit/studio/panels/design": Record<string, never>;
			"/tinykit/studio/panels/history": Record<string, never>;
			"/tinykit/upgrade": Record<string, never>;
			"/tinykit/[id]": { id: string };
			"/[...path]": { path: string }
		};
		Pathname(): "/" | "/_tk" | "/_tk/" | "/_tk/assets" | "/_tk/assets/" | `/_tk/assets/${string}` & {} | `/_tk/assets/${string}/` & {} | `/_tk/assets/${string}/${string}` & {} | `/_tk/assets/${string}/${string}/` & {} | "/_tk/data" | "/_tk/data/" | `/_tk/data/${string}` & {} | `/_tk/data/${string}/` & {} | `/_tk/data/${string}/${string}` & {} | `/_tk/data/${string}/${string}/` & {} | `/_tk/data/${string}/${string}/${string}` & {} | `/_tk/data/${string}/${string}/${string}/` & {} | "/_tk/realtime" | "/_tk/realtime/" | `/_tk/realtime/${string}` & {} | `/_tk/realtime/${string}/` & {} | "/api" | "/api/" | "/api/agent" | "/api/agent/" | "/api/agent/clear" | "/api/agent/clear/" | "/api/agent/test" | "/api/agent/test/" | "/api/auth" | "/api/auth/" | "/api/auth/save-server-credentials" | "/api/auth/save-server-credentials/" | "/api/domains" | "/api/domains/" | "/api/migrate-build-fields" | "/api/migrate-build-fields/" | "/api/projects" | "/api/projects/" | `/api/projects/${string}` & {} | `/api/projects/${string}/` & {} | `/api/projects/${string}/agent` & {} | `/api/projects/${string}/agent/` & {} | `/api/projects/${string}/build` & {} | `/api/projects/${string}/build/` & {} | `/api/projects/${string}/export` & {} | `/api/projects/${string}/export/` & {} | `/api/projects/${string}/templates` & {} | `/api/projects/${string}/templates/` & {} | "/api/proxy" | "/api/proxy/" | "/api/settings" | "/api/settings/" | "/api/settings/llm-status" | "/api/settings/llm-status/" | "/api/settings/validate-llm" | "/api/settings/validate-llm/" | "/api/setup" | "/api/setup/" | "/api/templates" | "/api/templates/" | `/api/templates/${string}` & {} | `/api/templates/${string}/` & {} | "/api/upgrade" | "/api/upgrade/" | "/login" | "/login/" | "/setup" | "/setup/" | "/tinykit" | "/tinykit/" | "/tinykit/components" | "/tinykit/components/" | "/tinykit/dashboard" | "/tinykit/dashboard/" | "/tinykit/dashboard/components" | "/tinykit/dashboard/components/" | "/tinykit/lib" | "/tinykit/lib/" | "/tinykit/new-kit" | "/tinykit/new-kit/" | "/tinykit/new" | "/tinykit/new/" | "/tinykit/preview" | "/tinykit/preview/" | `/tinykit/preview/${string}` & {} | `/tinykit/preview/${string}/` & {} | `/tinykit/preview/${string}/${string}` & {} | `/tinykit/preview/${string}/${string}/` & {} | "/tinykit/settings" | "/tinykit/settings/" | "/tinykit/studio" | "/tinykit/studio/" | "/tinykit/studio/components" | "/tinykit/studio/components/" | "/tinykit/studio/components/vibes" | "/tinykit/studio/components/vibes/" | "/tinykit/studio/panels" | "/tinykit/studio/panels/" | "/tinykit/studio/panels/agent" | "/tinykit/studio/panels/agent/" | "/tinykit/studio/panels/code" | "/tinykit/studio/panels/code/" | "/tinykit/studio/panels/code/CodeMirror" | "/tinykit/studio/panels/code/CodeMirror/" | "/tinykit/studio/panels/content" | "/tinykit/studio/panels/content/" | "/tinykit/studio/panels/data" | "/tinykit/studio/panels/data/" | "/tinykit/studio/panels/design" | "/tinykit/studio/panels/design/" | "/tinykit/studio/panels/history" | "/tinykit/studio/panels/history/" | "/tinykit/upgrade" | "/tinykit/upgrade/" | `/tinykit/${string}` & {} | `/tinykit/${string}/` & {} | `/${string}` & {} | `/${string}/` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/favicon.png" | "/logo-dark.svg" | "/logo-light.svg" | "/screenshot-bg.png" | "/screenshot.png" | string & {};
	}
}