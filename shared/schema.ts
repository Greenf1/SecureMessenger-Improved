import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  accessCode: text("access_code").notNull().unique(),
  isActive: boolean("is_active").default(true),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  accessCode: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
});

export const loginSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
