import type { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

export abstract class BaseRepository {
  protected pool: Pool;
  protected client: PoolClient | null = null;

  constructor(pool: Pool) {
    this.pool = pool;
  }

  protected async query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params?: unknown[],
  ): Promise<QueryResult<T>> {
    if (this.client) {
      return this.client.query<T>(text, params);
    }
    return this.pool.query<T>(text, params);
  }

  protected async beginTransaction(): Promise<void> {
    this.client = await this.pool.connect();
    await this.client.query("BEGIN");
  }

  protected async commit(): Promise<void> {
    if (!this.client) throw new Error("No active transaction to commit");
    try {
      await this.client.query("COMMIT");
    } finally {
      this.client.release();
      this.client = null;
    }
  }

  protected async rollback(): Promise<void> {
    if (!this.client) throw new Error("No active transaction to rollback");
    try {
      await this.client.query("ROLLBACK");
    } finally {
      this.client.release();
      this.client = null;
    }
  }

  async transaction<T>(fn: () => Promise<T>): Promise<T> {
    await this.beginTransaction();
    try {
      const result = await fn();
      await this.commit();
      return result;
    } catch (error) {
      await this.rollback();
      throw error;
    }
  }
}
