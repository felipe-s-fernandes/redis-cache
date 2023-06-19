import { config } from "dotenv";
config();
import pg from "pg";
const { Pool } = pg;

export default class ConnectDB {
    private pool;
    constructor() {
        this.pool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: Number(process.env.POSTGRES_DBPORT),
            max: 20,
            idleTimeoutMillis: 100,
        });
    }

    public async query(command: string, array?: Array<string | null>) {
        const client = await this.pool.connect();
        try {
            await client.query("BEGIN");
            const response = await client.query(command, array);
            await client.query("COMMIT");
            client.release();
            return response.rows;
        } catch (error) {
            await client.query("ROLLBACK");
            client.release();
            throw error;
        }
    }
}
