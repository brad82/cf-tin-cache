import { env, createExecutionContext, waitOnExecutionContext, SELF } from 'cloudflare:test';
import { describe, it, expect, beforeAll } from 'vitest';
import { randomUUID } from 'node:crypto';

const TinCanRequest = {
	timestamp: new Date().toISOString(),
	actor: { objectType: 'Agent', mbox: 'mailto:bmorris@mbl.com', name: 'Brad Morris' },
	context: {
		contextActivities: {
			parent: [{ id: 'https://example.com/wp-content/uploads/uncanny-snc/160/index_lms.html', objectType: 'Activity' }],
			grouping: [{ id: 'https://example.com/wp-content/uploads/uncanny-snc/160/index_lms.html', objectType: 'Activity' }],
		},
	},
	object: {
		id: 'https://example.com/wp-content/uploads/uncanny-snc/160/index_lms.html/6S8fJsJloie',
		objectType: 'Activity',
		definition: {
			type: 'http://adlnet.gov/expapi/activities/module',
			name: { und: 'Student Quote' },
			description: { und: 'Student Quote' },
		},
	},
};

beforeAll(async () => {
	const verbs = [
		'http://adlnet.gov/expapi/verbs/attempted',
		'http://adlnet.gov/expapi/verbs/answered',
		'http://adlnet.gov/expapi/verbs/completed',
		'http://adlnet.gov/expapi/verbs/passed',
		'http://adlnet.gov/expapi/verbs/failed',
	];
	await env.TIN_CACHE.put('TC_VERB_WHITELIST', JSON.stringify(verbs));
});

describe('Tin Cache worker', () => {
	const verbs = [
		{ verb: 'completed', expectedResponse: 200 },
		{ verb: 'experienced', expectedResponse: 202 },
	];

	verbs.forEach(({ verb, expectedResponse }) => {
		it(`responds with ${expectedResponse} for verb ${verb}`, async () => {
			const tcRequest = {
				...TinCanRequest,
				id: randomUUID(),
				verb: { id: `http://adlnet.gov/expapi/verbs/${verb}`, display: { 'en-US': verb } },
			};

			const response = await SELF.fetch('http://example.com/ucTinCan/statements', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(tcRequest),
			});

			expect(await response.json()).toContain(tcRequest.id);
			expect(response.status).toBe(expectedResponse);
		});
	});
});
