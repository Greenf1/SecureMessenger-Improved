import { users, messages, type User, type InsertUser, type Message, type InsertMessage } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByAccessCode(accessCode: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  getAllMessages(): Promise<Message[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private currentUserId: number;
  private currentMessageId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    
    // Initialize with some demo users
    this.initializeDemoUsers();
  }

  private async initializeDemoUsers() {
    const demoUsers = [
      { username: "User1", accessCode: "1234" },
      { username: "User2", accessCode: "5678" },
      { username: "Admin", accessCode: "9999" },
      { username: "Guest", accessCode: "0000" },
    ];

    for (const user of demoUsers) {
      await this.createUser(user);
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByAccessCode(accessCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.accessCode === accessCode && user.isActive,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      isActive: true,
    };
    this.users.set(id, user);
    return user;
  }

  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values()).filter(
      (message) => message.userId === userId,
    );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0),
    );
  }
}

export const storage = new MemStorage();
