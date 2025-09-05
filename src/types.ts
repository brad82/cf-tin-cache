export interface UCTinCanStatementRequest {
	id: string
	actor: {
		objectType: 'Agent';
		name: string;
		mbox: string;
	};
	verb: {
		id: string;
		display: Record<string, string>;
	};
	object: {
		id: string;
		objectType: 'Activity';
		definition: {
			name: Record<string, string>;
			description: Record<string, string>;
			type: string;
		}
	}
	timestamp: string;
}