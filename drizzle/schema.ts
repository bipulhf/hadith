import { relations } from "drizzle-orm";
import {
  integer,
  pgTable,
  primaryKey,
  serial,
  varchar,
} from "drizzle-orm/pg-core";

export const hadith = pgTable("hadiths", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 500 }).notNull(),
  rabi: varchar("rabi", { length: 255 }).notNull(),
  book: varchar("book", { length: 255 }).notNull(),
  level: varchar("level", { length: 255 }).notNull(),
});

export const hadithRelations = relations(hadith, ({ one, many }) => ({
  favHadiths: many(favHadith),
}));

export const favHadith = pgTable(
  "fav_hadiths",
  {
    hadithId: integer("hadith_id")
      .notNull()
      .references(() => hadith.id),
    mobile: varchar("mobile", { length: 11 }).notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.hadithId, table.mobile] }),
  })
);

export const favHadithRelations = relations(favHadith, ({ one }) => ({
  hadith: one(hadith, {
    fields: [favHadith.hadithId],
    references: [hadith.id],
  }),
}));

export const favContact = pgTable("fav_contacts", {
  user_mobile: varchar("user_mobile", { length: 11 }).notNull(),
  fav_mobile: varchar("fav_mobile", { length: 11 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
});
