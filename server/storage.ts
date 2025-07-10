import { users, messages, calls, discussions, type User, type InsertUser, type Message, type InsertMessage, type Call, type InsertCall, type Discussion, type InsertDiscussion } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
  getCalls(userId: number): Promise<Call[]>;
  createCall(call: InsertCall): Promise<Call>;
  getDiscussions(userId: number): Promise<Discussion[]>;
  createDiscussion(discussion: InsertDiscussion): Promise<Discussion>;
}

// Production-ready DatabaseStorage implementation

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.accessCode, accessCode));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getMessages(userId: number): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.userId, userId));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return await db.select().from(messages);
  }

  async getCalls(userId: number): Promise<Call[]> {
    return await db.select().from(calls).where(
      or(eq(calls.callerId, userId), eq(calls.receiverId, userId))
    );
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const [call] = await db
      .insert(calls)
      .values(insertCall)
      .returning();
    return call;
  }

  async getDiscussions(userId: number): Promise<Discussion[]> {
    return await db.select().from(discussions).where(eq(discussions.participantId, userId));
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const [discussion] = await db
      .insert(discussions)
      .values(insertDiscussion)
      .returning();
    return discussion;
  }
}

export const storage = new DatabaseStorage();
