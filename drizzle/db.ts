import { configDotenv } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
configDotenv();

// for query purposes
const queryClient = postgres(process.env.DATABASE_URL as string);
export const db = drizzle(queryClient);
