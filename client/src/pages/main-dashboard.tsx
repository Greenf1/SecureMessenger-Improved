import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LogOut, MessageCircle, Phone, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CallsPage from "./calls";
import DiscussionsPage from "./discussions";
import ChatDashboard from "./chat-dashboard";

interface MainDashboardProps {
  onLogout: () => void;
}

type ActiveTab = "discussions" | "calls" | "settings" | "chat";

interface User {
  id: number;
  username: string;
}

export default function MainDashboard({ onLogout }: MainDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("discussions");
  const [selectedChatUser, setSelectedChatUser] = useState<number | null>(null);
  
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.clear();
      onLogout();
    },
  });

  const handleSelectDiscussion = (userId: number) => {
    setSelectedChatUser(userId);
    setActiveTab("chat");
  };

  const handleBackToDiscussions = () => {
    setSelectedChatUser(null);
    setActiveTab("discussions");
  };

  const renderContent = () => {
    if (activeTab === "chat" && selectedChatUser) {
      return (
        <ChatDashboard 
          onLogout={() => logoutMutation.mutate()}
          onBack={handleBackToDiscussions}
          targetUserId={selectedChatUser}
        />
      );
    }

    switch (activeTab) {
      case "discussions":
        return (
          <DiscussionsPage 
            currentUserId={currentUser?.id || 0}
            onSelectDiscussion={handleSelectDiscussion}
          />
        );
      case "calls":
        return <CallsPage currentUserId={currentUser?.id || 0} />;
      case "settings":
        return <SettingsPage currentUser={currentUser} onLogout={() => logoutMutation.mutate()} />;
      default:
        return <DiscussionsPage currentUserId={currentUser?.id || 0} onSelectDiscussion={handleSelectDiscussion} />;
    }
  };

  // Don't show bottom nav when in chat mode
  const showBottomNav = activeTab !== "chat";

  return (
    <motion.div
      className="flex flex-col h-screen bg-gray-100"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Main Content */}
      <div className={`flex-1 ${showBottomNav ? "pb-16" : ""}`}>
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex">
          <NavItem
            icon={<MessageCircle className="h-6 w-6" />}
            label="Discussions"
            active={activeTab === "discussions"}
            onClick={() => setActiveTab("discussions")}
            badge={2}
          />
          <NavItem
            icon={<Phone className="h-6 w-6" />}
            label="Appels"
            active={activeTab === "calls"}
            onClick={() => setActiveTab("calls")}
          />
          <NavItem
            icon={<Users className="h-6 w-6" />}
            label="Outils"
            active={false}
            onClick={() => {}}
          />
          <NavItem
            icon={<Settings className="h-6 w-6" />}
            label="Paramètres"
            active={activeTab === "settings"}
            onClick={() => setActiveTab("settings")}
            badge={1}
          />
        </div>
      )}
    </motion.div>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function NavItem({ icon, label, active, onClick, badge }: NavItemProps) {
  return (
    <Button
      variant="ghost"
      className={`flex-1 flex flex-col items-center justify-center py-2 px-1 h-16 rounded-none relative ${
        active
          ? "text-green-500 bg-green-50"
          : "text-gray-600 hover:text-green-500 hover:bg-gray-50"
      }`}
      onClick={onClick}
    >
      <div className="relative">
        {icon}
        {badge && badge > 0 && (
          <Badge 
            variant="secondary" 
            className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-500 text-white text-xs flex items-center justify-center p-0"
          >
            {badge > 9 ? "9+" : badge}
          </Badge>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </Button>
  );
}

interface SettingsPageProps {
  currentUser?: User;
  onLogout: () => void;
}

function SettingsPage({ currentUser, onLogout }: SettingsPageProps) {
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-green-500 text-white p-4">
        <h1 className="text-xl font-semibold">Paramètres</h1>
      </div>

      {/* Profile Section */}
      <div className="bg-white p-4 border-b">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-2xl">👤</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentUser?.username || "Utilisateur"}
            </h2>
            <p className="text-sm text-gray-500">En ligne</p>
          </div>
        </div>
      </div>

      {/* Settings Options */}
      <div className="flex-1 bg-white">
        <div className="p-4 space-y-4">
          <SettingsOption
            icon="🔐"
            title="Sécurité"
            description="Changer votre code d'accès"
          />
          <SettingsOption
            icon="🔔"
            title="Notifications"
            description="Gérer les notifications"
          />
          <SettingsOption
            icon="🌙"
            title="Thème"
            description="Clair ou sombre"
          />
          <SettingsOption
            icon="💬"
            title="Chat"
            description="Paramètres de conversation"
          />
          <SettingsOption
            icon="📞"
            title="Appels"
            description="Paramètres d'appel"
          />
          <SettingsOption
            icon="📱"
            title="Stockage"
            description="Gérer l'espace de stockage"
          />
          <SettingsOption
            icon="❓"
            title="Aide"
            description="Centre d'aide"
          />
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center space-x-2 text-red-500 border-red-500 hover:bg-red-50"
            onClick={onLogout}
          >
            <LogOut className="h-4 w-4" />
            <span>Se déconnecter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface SettingsOptionProps {
  icon: string;
  title: string;
  description: string;
}

function SettingsOption({ icon, title, description }: SettingsOptionProps) {
  return (
    <Button
      variant="ghost"
      className="w-full flex items-center justify-start space-x-4 p-4 h-auto hover:bg-gray-50"
    >
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Button>
  );
}