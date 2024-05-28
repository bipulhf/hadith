import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

configDotenv();

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL as string, {
  prepare: false,
});
const db = drizzle(queryClient, { schema });

export default db;
