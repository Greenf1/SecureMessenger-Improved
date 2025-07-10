import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Phone, PhoneCall, VideoIcon, PhoneMissed, PhoneIncoming, PhoneOutgoing } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Call {
  id: number;
  callerId: number;
  receiverId: number;
  type: "voice" | "video";
  status: "incoming" | "outgoing" | "missed";
  duration: number;
  timestamp: string;
}

interface User {
  id: number;
  username: string;
  avatar?: string;
  status?: string;
}

interface CallsPageProps {
  currentUserId: number;
}

export default function CallsPage({ currentUserId }: CallsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("Toutes");

  // Get calls data
  const { data: calls = [], isLoading: callsLoading } = useQuery<Call[]>({
    queryKey: ["/api/calls"],
    refetchInterval: 3000,
  });

  // Get users data to display names
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ["/api/users"],
  });

  const getUserInfo = (userId: number): User | undefined => {
    return users.find(user => user.id === userId);
  };

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

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getCallIcon = (call: Call) => {
    if (call.status === "missed") {
      return <PhoneMissed className="h-4 w-4 text-red-500" />;
    } else if (call.status === "incoming") {
      return <PhoneIncoming className="h-4 w-4 text-green-500" />;
    } else {
      return <PhoneOutgoing className="h-4 w-4 text-blue-500" />;
    }
  };

  const getCallTypeIcon = (type: string) => {
    return type === "video" ? (
      <VideoIcon className="h-4 w-4 text-gray-500" />
    ) : (
      <Phone className="h-4 w-4 text-gray-500" />
    );
  };

  const filteredCalls = calls.filter(call => {
    const otherUserId = call.callerId === currentUserId ? call.receiverId : call.callerId;
    const otherUser = getUserInfo(otherUserId);
    const matchesSearch = otherUser?.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === "Manqués") {
      return call.status === "missed" && matchesSearch;
    }
    return matchesSearch;
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <h1 className="text-xl font-semibold">Appels</h1>
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
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b">
        {["Toutes", "Manqués"].map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? "default" : "ghost"}
            className={`flex-1 rounded-none ${
              activeTab === tab
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </Button>
        ))}
      </div>

      {/* Add to Favorites */}
      <div className="p-4 bg-white border-b">
        <h2 className="text-lg font-semibold mb-2">Favoris</h2>
        <Button
          variant="ghost"
          className="flex items-center space-x-3 w-full justify-start p-3 hover:bg-gray-50"
        >
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <span className="text-gray-700">Ajouter aux favoris</span>
        </Button>
      </div>

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Récents</h2>
          {callsLoading ? (
            <div className="text-center text-gray-500">Chargement...</div>
          ) : filteredCalls.length === 0 ? (
            <div className="text-center text-gray-500">Aucun appel trouvé</div>
          ) : (
            <div className="space-y-2">
              {filteredCalls.map((call) => {
                const otherUserId = call.callerId === currentUserId ? call.receiverId : call.callerId;
                const otherUser = getUserInfo(otherUserId);
                
                return (
                  <motion.div
                    key={call.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-lg">{otherUser?.avatar || "👤"}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">
                            {otherUser?.username || "Utilisateur inconnu"}
                          </h3>
                          {getCallIcon(call)}
                          {getCallTypeIcon(call.type)}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{formatTime(call.timestamp)}</span>
                          {call.duration > 0 && (
                            <span>• {formatDuration(call.duration)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-green-500 hover:text-green-600"
                    >
                      <PhoneCall className="h-5 w-5" />
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}