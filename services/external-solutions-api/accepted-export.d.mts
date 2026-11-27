export interface AcceptedBatch { nextCursor: number; count: number; path: string; content: string; }
export function nextAcceptedBatch(db: D1Database, cursor: number, limit?: number): Promise<AcceptedBatch | null>;
