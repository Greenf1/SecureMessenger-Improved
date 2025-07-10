import { users, messages, calls, discussions, type User, type InsertUser, type Message, type InsertMessage, type Call, type InsertCall, type Discussion, type InsertDiscussion } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private calls: Map<number, Call>;
  private discussions: Map<number, Discussion>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentCallId: number;
  private currentDiscussionId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.calls = new Map();
    this.discussions = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentCallId = 1;
    this.currentDiscussionId = 1;
    
    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeDemoData() {
    // Create demo users
    const demoUsers = [
      { username: "Augustin Rashidi", accessCode: "1234", avatar: "👨‍💼", phone: "+33 6 12 34 56 78", status: "En ligne" },
      { username: "Issa Hôtel Baobab", accessCode: "5678", avatar: "🏨", phone: "+33 6 23 45 67 89", status: "Dernière fois hier" },
      { username: "Khalifa Bally", accessCode: "9999", avatar: "👩‍💻", phone: "+33 6 34 56 78 90", status: "En ligne" },
      { username: "Mariam Sow", accessCode: "0000", avatar: "👩‍🎨", phone: "+33 6 45 67 89 01", status: "Dernière fois à 17:49" },
      { username: "Messi Léo", accessCode: "1111", avatar: "⚽", phone: "+33 6 56 78 90 12", status: "En ligne" },
      { username: "Mohamed", accessCode: "2222", avatar: "🧑‍🔬", phone: "+33 6 67 89 01 23", status: "En ligne" },
    ];

    for (const user of demoUsers) {
      await this.createUser(user);
    }

    // Create demo messages
    await this.createMessage({ userId: 1, content: "Salut, comment ça va?", type: "text" });
    await this.createMessage({ userId: 2, content: "Ça va bien, merci! Et toi?", type: "text" });
    await this.createMessage({ userId: 5, content: "On te voit plus j'espère que tout va bien", type: "text" });
    
    // Create demo calls
    await this.createCall({ callerId: 1, receiverId: 2, type: "voice", status: "outgoing", duration: 125 });
    await this.createCall({ callerId: 2, receiverId: 1, type: "voice", status: "incoming", duration: 89 });
    await this.createCall({ callerId: 3, receiverId: 1, type: "video", status: "missed", duration: 0 });
    await this.createCall({ callerId: 4, receiverId: 1, type: "voice", status: "outgoing", duration: 234 });
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
      status: insertUser.status || "En ligne",
    };
    this.users.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
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
      type: insertMessage.type || "text",
      isRead: false,
    };
    this.messages.set(id, message);
    return message;
  }

  async getAllMessages(): Promise<Message[]> {
    return Array.from(this.messages.values()).sort(
      (a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0),
    );
  }

  async getCalls(userId: number): Promise<Call[]> {
    return Array.from(this.calls.values()).filter(
      (call) => call.callerId === userId || call.receiverId === userId,
    ).sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.currentCallId++;
    const call: Call = {
      ...insertCall,
      id,
      timestamp: new Date(),
    };
    this.calls.set(id, call);
    return call;
  }

  async getDiscussions(userId: number): Promise<Discussion[]> {
    return Array.from(this.discussions.values()).filter(
      (discussion) => discussion.participantId === userId,
    );
  }

  async createDiscussion(insertDiscussion: InsertDiscussion): Promise<Discussion> {
    const id = this.currentDiscussionId++;
    const discussion: Discussion = {
      ...insertDiscussion,
      id,
      timestamp: new Date(),
    };
    this.discussions.set(id, discussion);
    return discussion;
  }
}

export const storage = new MemStorage();
