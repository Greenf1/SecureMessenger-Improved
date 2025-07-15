import { pgTable, text, serial, integer, boolean, timestamp, uuid, index, unique, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Table des utilisateurs avec améliorations
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  accessCode: varchar("access_code", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  avatar: text("avatar"),
  status: varchar("status", { length: 50 }).default("En ligne"),
  lastSeen: timestamp("last_seen").defaultNow(),
  isActive: boolean("is_active").default(true),
  isOnline: boolean("is_online").default(false),
  publicKey: text("public_key"), // Pour le chiffrement end-to-end
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("users_username_idx").on(table.username),
  accessCodeIdx: index("users_access_code_idx").on(table.accessCode),
  emailIdx: index("users_email_idx").on(table.email),
  statusIdx: index("users_status_idx").on(table.status),
}));

// Table des groupes
export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  avatar: text("avatar"),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  isPrivate: boolean("is_private").default(false),
  maxMembers: integer("max_members").default(100),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("groups_name_idx").on(table.name),
  createdByIdx: index("groups_created_by_idx").on(table.createdBy),
}));

// Table des membres de groupes
export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => groups.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: varchar("role", { length: 20 }).default("member"), // admin, moderator, member
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
}, (table) => ({
  groupUserUnique: unique("group_user_unique").on(table.groupId, table.userId),
  groupIdIdx: index("group_members_group_id_idx").on(table.groupId),
  userIdIdx: index("group_members_user_id_idx").on(table.userId),
}));

// Table des discussions améliorée
export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // private, group
  groupId: integer("group_id").references(() => groups.id),
  name: varchar("name", { length: 100 }),
  lastMessageId: integer("last_message_id"),
  lastActivity: timestamp("last_activity").defaultNow(),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("discussions_type_idx").on(table.type),
  groupIdIdx: index("discussions_group_id_idx").on(table.groupId),
  lastActivityIdx: index("discussions_last_activity_idx").on(table.lastActivity),
}));

// Table des participants aux discussions
export const discussionParticipants = pgTable("discussion_participants", {
  id: serial("id").primaryKey(),
  discussionId: integer("discussion_id").references(() => discussions.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  unreadCount: integer("unread_count").default(0),
  isPinned: boolean("is_pinned").default(false),
  isMuted: boolean("is_muted").default(false),
  joinedAt: timestamp("joined_at").defaultNow(),
  lastReadAt: timestamp("last_read_at"),
}, (table) => ({
  discussionUserUnique: unique("discussion_user_unique").on(table.discussionId, table.userId),
  discussionIdIdx: index("discussion_participants_discussion_id_idx").on(table.discussionId),
  userIdIdx: index("discussion_participants_user_id_idx").on(table.userId),
}));

// Table des messages améliorée
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  discussionId: integer("discussion_id").references(() => discussions.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  replyToId: integer("reply_to_id").references(() => messages.id),
  content: text("content").notNull(),
  encryptedContent: text("encrypted_content"), // Contenu chiffré
  type: varchar("type", { length: 20 }).default("text"), // text, image, voice, video, file, location
  metadata: jsonb("metadata"), // Métadonnées flexibles (taille fichier, durée, etc.)
  isEdited: boolean("is_edited").default(false),
  editedAt: timestamp("edited_at"),
  isDeleted: boolean("is_deleted").default(false),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  discussionIdIdx: index("messages_discussion_id_idx").on(table.discussionId),
  senderIdIdx: index("messages_sender_id_idx").on(table.senderId),
  createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  typeIdx: index("messages_type_idx").on(table.type),
}));

// Table du statut des messages
export const messageStatus = pgTable("message_status", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // sent, delivered, read
  timestamp: timestamp("timestamp").defaultNow(),
}, (table) => ({
  messageUserUnique: unique("message_user_status_unique").on(table.messageId, table.userId),
  messageIdIdx: index("message_status_message_id_idx").on(table.messageId),
  userIdIdx: index("message_status_user_id_idx").on(table.userId),
  statusIdx: index("message_status_status_idx").on(table.status),
}));

// Table des pièces jointes
export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  messageId: integer("message_id").references(() => messages.id).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  thumbnailPath: text("thumbnail_path"),
  isEncrypted: boolean("is_encrypted").default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  messageIdIdx: index("attachments_message_id_idx").on(table.messageId),
  mimeTypeIdx: index("attachments_mime_type_idx").on(table.mimeType),
}));

// Table des appels améliorée
export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  uuid: uuid("uuid").defaultRandom().notNull().unique(),
  discussionId: integer("discussion_id").references(() => discussions.id),
  initiatorId: integer("initiator_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // voice, video, screen_share
  status: varchar("status", { length: 20 }).notNull(), // initiated, ringing, active, ended, missed, declined
  duration: integer("duration").default(0), // en secondes
  quality: varchar("quality", { length: 20 }), // poor, fair, good, excellent
  endReason: varchar("end_reason", { length: 50 }), // normal, network_error, declined, etc.
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  discussionIdIdx: index("calls_discussion_id_idx").on(table.discussionId),
  initiatorIdIdx: index("calls_initiator_id_idx").on(table.initiatorId),
  statusIdx: index("calls_status_idx").on(table.status),
  createdAtIdx: index("calls_created_at_idx").on(table.createdAt),
}));

// Table des participants aux appels
export const callParticipants = pgTable("call_participants", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  joinedAt: timestamp("joined_at"),
  leftAt: timestamp("left_at"),
  status: varchar("status", { length: 20 }).notNull(), // invited, joined, left, declined
}, (table) => ({
  callUserUnique: unique("call_user_unique").on(table.callId, table.userId),
  callIdIdx: index("call_participants_call_id_idx").on(table.callId),
  userIdIdx: index("call_participants_user_id_idx").on(table.userId),
}));

// Table des clés de chiffrement
export const encryptionKeys = pgTable("encryption_keys", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  keyType: varchar("key_type", { length: 20 }).notNull(), // public, private, session
  keyData: text("key_data").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("encryption_keys_user_id_idx").on(table.userId),
  keyTypeIdx: index("encryption_keys_key_type_idx").on(table.keyType),
}));

// Table des logs d'audit
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: integer("resource_id"),
  details: jsonb("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("audit_logs_user_id_idx").on(table.userId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  resourceTypeIdx: index("audit_logs_resource_type_idx").on(table.resourceType),
  createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
}));

// Table des notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // message, call, system
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  data: jsonb("data"), // Données supplémentaires
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  typeIdx: index("notifications_type_idx").on(table.type),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
}));

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  sentMessages: many(messages, { relationName: "sender" }),
  groupMemberships: many(groupMembers),
  discussionParticipations: many(discussionParticipants),
  initiatedCalls: many(calls, { relationName: "initiator" }),
  callParticipations: many(callParticipants),
  encryptionKeys: many(encryptionKeys),
  auditLogs: many(auditLogs),
  notifications: many(notifications),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  discussions: many(discussions),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  discussion: one(discussions, {
    fields: [messages.discussionId],
    references: [discussions.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
  attachments: many(attachments),
  statuses: many(messageStatus),
}));

export const discussionsRelations = relations(discussions, ({ one, many }) => ({
  group: one(groups, {
    fields: [discussions.groupId],
    references: [groups.id],
  }),
  participants: many(discussionParticipants),
  messages: many(messages),
  calls: many(calls),
}));

// Schémas de validation Zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  accessCode: true,
  email: true,
  phone: true,
  avatar: true,
  status: true,
  publicKey: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  avatar: true,
  createdBy: true,
  isPrivate: true,
  maxMembers: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  discussionId: true,
  senderId: true,
  replyToId: true,
  content: true,
  encryptedContent: true,
  type: true,
  metadata: true,
});

export const insertCallSchema = createInsertSchema(calls).pick({
  discussionId: true,
  initiatorId: true,
  type: true,
  status: true,
  duration: true,
  quality: true,
  endReason: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).pick({
  type: true,
  groupId: true,
  name: true,
});

export const loginSchema = z.object({
  code: z.string().min(1, "Code is required"),
});

// Types TypeScript
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type Call = typeof calls.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type Discussion = typeof discussions.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
export type Attachment = typeof attachments.$inferSelect;
export type MessageStatus = typeof messageStatus.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
