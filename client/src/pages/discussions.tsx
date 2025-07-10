import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Search, Camera, Plus, Archive, MessageCircle, Phone, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  userId: number;
  content: string;
  timestamp: string;
  type: string;
  isRead: boolean;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
  status?: string;
}

interface Discussion {
  id: number;
  participant: User;
  lastMessage: Message;
  unreadCount: number;
  timestamp: string;
  isPinned: boolean;
  isArchived: boolean;
}

interface DiscussionsPageProps {
  currentUserId: number;
  onSelectDiscussion: (userId: number) => void;
}

export default function DiscussionsPage({ currentUserId, onSelectDiscussion }: DiscussionsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Toutes");

  // Get messages and users to build discussions
  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    refetchInterval: 3000,
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Build discussions from messages and users
  const buildDiscussions = (): Discussion[] => {
    const discussionMap = new Map<number, Discussion>();
    
    // Group messages by participant
    users.forEach(user => {
      const userMessages = messages.filter(msg => msg.userId === user.id);
      const lastMessage = userMessages[userMessages.length - 1];
      
      if (lastMessage) {
        const unreadCount = userMessages.filter(msg => !msg.isRead).length;
        
        discussionMap.set(user.id, {
          id: user.id,
          participant: user,
          lastMessage,
          unreadCount,
          timestamp: lastMessage.timestamp,
          isPinned: false,
          isArchived: false,
        });
      }
    });

    return Array.from(discussionMap.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  };

  const discussions = buildDiscussions();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Hier";
    } else {
      return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
    }
  };

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesSearch = discussion.participant.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Non lues") {
      return discussion.unreadCount > 0 && matchesSearch;
    } else if (activeTab === "Favoris") {
      return discussion.isPinned && matchesSearch;
    } else if (activeTab === "Groupes") {
      return false; // No groups in this demo
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Discussions</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="text-white">
              <Camera className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 bg-white border-b">
        <div className="relative">
          <Input
            type="text"
            placeholder="Rechercher"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-100 border-none rounded-full"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b text-sm">
        {["Toutes", "Non lues", "Favoris", "Groupes"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            className={`flex-1 rounded-none py-3 ${
              activeTab === tab
                ? "text-green-500 border-b-2 border-green-500"
                : "text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Archives */}
      <div className="p-4 bg-white border-b">
        <Button
          variant="ghost"
          className="flex items-center space-x-3 w-full justify-start p-3 hover:bg-gray-50"
        >
          <Archive className="h-5 w-5 text-gray-500" />
          <span className="text-gray-700">Archivées</span>
        </Button>
      </div>

      {/* Discussions List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {messagesLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Chargement des discussions...</div>
          </div>
        ) : filteredDiscussions.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Aucune discussion trouvée</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredDiscussions.map((discussion) => (
              <motion.div
                key={discussion.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
                onClick={() => onSelectDiscussion(discussion.participant.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-lg">{discussion.participant.avatar || "👤"}</span>
                    </div>
                    {discussion.participant.status === "En ligne" && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 truncate">
                        {discussion.participant.username}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTime(discussion.timestamp)}
                        </span>
                        {discussion.unreadCount > 0 && (
                          <Badge variant="secondary" className="bg-green-500 text-white text-xs">
                            {discussion.unreadCount > 9 ? "9+" : discussion.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500 truncate">
                        {discussion.lastMessage.type === "voice" ? "🎵 Message vocal" : discussion.lastMessage.content}
                      </p>
                      <div className="flex items-center space-x-1 ml-2">
                        <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-green-500">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="p-1 text-gray-400 hover:text-green-500">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}