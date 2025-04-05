import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { default as users } from "./users";

export const assets = pgTable("assets", {
    id: uuid("id").defaultRandom().primaryKey(),
    url: varchar("url", { length: 512 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    userId: uuid("user_id").notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
