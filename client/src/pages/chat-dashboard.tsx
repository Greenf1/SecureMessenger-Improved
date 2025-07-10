import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Send, Paperclip, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatDashboardProps {
  onLogout: () => void;
}

interface Message {
  id: number;
  userId: number;
  content: string;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
}

export default function ChatDashboard({ onLogout }: ChatDashboardProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Get messages
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 3000, // Refresh every 3 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", { content });
      return response.json();
    },
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages"] });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout");
      return response.json();
    },
    onSuccess: () => {
      onLogout();
    },
  });

  const handleSendMessage = () => {
    const message = messageInput.trim();
    if (message === "") return;
    sendMessageMutation.mutate(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <motion.div
      className="min-h-screen bg-gray-100 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="bg-green-500 text-white p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">Secure Chat</h1>
              <p className="text-sm opacity-90">
                {currentUser ? `Connecté en tant que ${currentUser.username}` : "En ligne"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logoutMutation.mutate()}
            className="text-white hover:text-gray-200 hover:bg-green-600"
          >
            <LogOut className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100vh - 140px)" }}>
        {/* Welcome Message */}
        <div className="flex justify-center">
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm">
            🔐 Connexion sécurisée établie
          </div>
        </div>

        {/* Messages */}
        {messagesLoading ? (
          <div className="flex justify-center">
            <div className="text-gray-500">Chargement des messages...</div>
          </div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.userId === currentUser?.id;
            return (
              <motion.div
                key={message.id}
                className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl shadow-sm ${
                    isCurrentUser
                      ? "bg-green-100 text-gray-800 rounded-br-md"
                      : "bg-white text-gray-800 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <span className="text-xs text-gray-500 mt-1 block">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-green-500"
          >
            <Paperclip className="h-6 w-6" />
          </Button>
          <Input
            type="text"
            placeholder="Tapez votre message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 focus:outline-none focus:bg-white border border-transparent focus:border-green-500"
            disabled={sendMessageMutation.isPending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending || messageInput.trim() === ""}
            className="bg-green-500 text-white rounded-full hover:bg-green-600"
            size="icon"
          >
            <Send className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
