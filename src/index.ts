/**
 * TinCache proxy
 */

import { UCTinCanStatementRequest } from './types';

export default {
	async fetch(request, env, ctx): Promise<Response> {

		if( (await env.TIN_CACHE.get('TC_ENABLED') ?? 'true') !== 'true') {
			console.trace('Tin Cache disabled by configuration, skipping request')
			return await fetch(request);
		}

		let verbs = JSON.parse((await env.TIN_CACHE.get('TC_VERB_WHITELIST')) ?? '[]');
		const body = (await request.json()) as UCTinCanStatementRequest;
		
		console.log(body)
	
		// Allow whitelisted verbs to continue straight to the server.
		if (verbs.includes(body.verb.id)) {
			return await fetch(request);
		}

		return new Response(JSON.stringify([body.id]), { status: 202, statusText: 'Accepted', headers: { "X-TinCache-Delayed": "Indefinitely"} });
	},
} satisfies ExportedHandler<Env>;
