import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const notifications = pgTable('notifications', {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id').notNull(),
    type: text('type').notNull(), // e.g., "invite", "comment"
    message: text('message').notNull(), // display text or JSON if you prefer
    data: text('data').default('{}'), // optional payload (stringified JSON)
    isRead: boolean('is_read').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;