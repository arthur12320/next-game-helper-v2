"use server"

import db from "@/db";
import { notifications } from "@/db/schema";
import { and, count, desc, eq } from "drizzle-orm";
import { auth } from "../../../auth";


// Fetch notifications for the current user
export async function getUserNotifications() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    const userNotifications = await db.query.notifications.findMany({
        where: eq(notifications.userId, session.user.id as string),
        orderBy: [desc(notifications.createdAt)],
        limit: 20, // Limit to recent notifications
    })

    return userNotifications
}

// Get unread notification count
export async function getUnreadNotificationCount() {
    const session = await auth()
    if (!session?.user?.id) return 0

    const result = await db
        .select({ count: count() })
        .from(notifications)
        .where(and(eq(notifications.userId, session.user.id as string), eq(notifications.isRead, false)))

    return Number(result[0]?.count || 0)
}

// Mark a single notification as read
export async function markNotificationAsRead(notificationId: string) {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id as string)))

    return true
}

// Mark all notifications as read
export async function markAllNotificationsAsRead() {
    const session = await auth()
    if (!session?.user?.id) throw new Error("Unauthorized")

    await db
        .update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, session.user.id as string))

    return true
}

export async function addNotification(message: string, type: string, userEmail: string, data?: string) {
    const session = await auth();
    if (!session?.user) throw new Error("Unauthorized");

    const user = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.email, userEmail),
    })

    if (!user) throw new Error("User not found");

    await db.insert(notifications).values({
        userId: user?.id,
        type,
        message,
        data
    });
}