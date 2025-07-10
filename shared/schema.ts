import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  accessCode: text("access_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
  avatar: text("avatar"),
  phone: text("phone"),
  status: text("status").default("En ligne"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  type: text("type").default("text"), // text, image, voice, video
  isRead: boolean("is_read").default(false),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  callerId: integer("caller_id").references(() => users.id),
  receiverId: integer("receiver_id").references(() => users.id),
  type: text("type").notNull(), // voice, video
  status: text("status").notNull(), // incoming, outgoing, missed
  duration: integer("duration").default(0), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
});

export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  participantId: integer("participant_id").references(() => users.id),
  lastMessageId: integer("last_message_id").references(() => messages.id),
  unreadCount: integer("unread_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isArchived: boolean("is_archived").default(false),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  accessCode: true,
  avatar: true,
  phone: true,
  status: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  type: true,
});

export const insertCallSchema = createInsertSchema(calls).pick({
  callerId: true,
  receiverId: true,
  type: true,
  status: true,
  duration: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).pick({
  participantId: true,
  lastMessageId: true,
  unreadCount: true,
  isPinned: true,
  isArchived: true,
});

export const loginSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
