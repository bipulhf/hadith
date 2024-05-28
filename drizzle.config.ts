import { defineConfig } from "drizzle-kit";
import { configDotenv } from "dotenv";
configDotenv();

export default defineConfig({
  schema: "./drizzle/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
  },
  verbose: true,
});
