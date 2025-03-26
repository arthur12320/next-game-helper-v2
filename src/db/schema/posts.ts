import { pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { chapters }  from "./chapters";
import  users  from "./users";

export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
});

export const postRelations = relations(posts, ({ one }) => ({
  chapter: one(chapters, {
    fields: [posts.chapterId],
    references: [chapters.id],
  }),
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
}));

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
