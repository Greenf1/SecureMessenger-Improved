import { db } from './db';
import { users, messages, calls, discussions } from '../shared/schema';

async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // Create demo users
    const demoUsers = [
      { username: "Augustin Rashidi", accessCode: "1234", avatar: "👨‍💼", phone: "+33 6 12 34 56 78", status: "En ligne", isActive: true },
      { username: "Issa Hôtel Baobab", accessCode: "5678", avatar: "🏨", phone: "+33 6 23 45 67 89", status: "Dernière fois hier", isActive: true },
      { username: "Khalifa Bally", accessCode: "9999", avatar: "👩‍💻", phone: "+33 6 34 56 78 90", status: "En ligne", isActive: true },
      { username: "Mariam Sow", accessCode: "0000", avatar: "👩‍🎨", phone: "+33 6 45 67 89 01", status: "Dernière fois à 17:49", isActive: true },
      { username: "Messi Léo", accessCode: "1111", avatar: "⚽", phone: "+33 6 56 78 90 12", status: "En ligne", isActive: true },
      { username: "Mohamed", accessCode: "2222", avatar: "🧑‍🔬", phone: "+33 6 67 89 01 23", status: "En ligne", isActive: true },
    ];

    // Insert users
    const insertedUsers = await db.insert(users).values(demoUsers).returning();
    console.log(`Inserted ${insertedUsers.length} users`);

    // Create demo messages
    const demoMessages = [
      { userId: 1, content: "Salut, comment ça va?", type: "text", isRead: false },
      { userId: 2, content: "Ça va bien, merci! Et toi?", type: "text", isRead: false },
      { userId: 5, content: "On te voit plus j'espère que tout va bien", type: "text", isRead: false },
    ];

    const insertedMessages = await db.insert(messages).values(demoMessages).returning();
    console.log(`Inserted ${insertedMessages.length} messages`);

    // Create demo calls
    const demoCalls = [
      { callerId: 1, receiverId: 2, type: "voice", status: "outgoing", duration: 125 },
      { callerId: 2, receiverId: 1, type: "voice", status: "incoming", duration: 89 },
      { callerId: 3, receiverId: 1, type: "video", status: "missed", duration: 0 },
      { callerId: 4, receiverId: 1, type: "voice", status: "outgoing", duration: 234 },
    ];

    const insertedCalls = await db.insert(calls).values(demoCalls).returning();
    console.log(`Inserted ${insertedCalls.length} calls`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedDatabase();