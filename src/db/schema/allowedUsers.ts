import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const allowedUsers = pgTable("allowed_users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
});
