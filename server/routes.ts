import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { code } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByAccessCode(code);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: "Code incorrect" 
        });
      }

      // Store user session (simplified)
      req.session = req.session || {};
      (req.session as any).userId = user.id;
      
      res.json({ 
        success: true, 
        message: "Accès autorisé",
        user: {
          id: user.id,
          username: user.username,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(400).json({ 
        success: false, 
        message: "Erreur de validation" 
      });
    }
  });

  // Get messages endpoint
  app.get("/api/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const messages = await storage.getAllMessages();
      res.json(messages);
    } catch (error) {
      console.error("Get messages error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Send message endpoint
  app.post("/api/messages", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const { content } = req.body;
      if (!content || content.trim() === "") {
        return res.status(400).json({ message: "Message vide" });
      }

      const message = await storage.createMessage({
        userId,
        content: content.trim(),
      });

      res.json(message);
    } catch (error) {
      console.error("Send message error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Get current user endpoint
  app.get("/api/user", async (req, res) => {
    try {
      const userId = (req.session as any)?.userId;
      if (!userId) {
        return res.status(401).json({ message: "Non authentifié" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session = null;
    res.json({ success: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
