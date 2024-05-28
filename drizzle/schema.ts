import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

export const user = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  mobile: varchar("mobile", { length: 11 }).unique(),
});

export const hadith = pgTable("hadiths", {
  id: serial("id").primaryKey(),
  description: varchar("description", { length: 1000 }).notNull(),
  rabi: varchar("rabi", { length: 255 }).notNull(),
  book: varchar("book", { length: 255 }).notNull(),
  level: varchar("level", { length: 255 }).notNull(),
});
