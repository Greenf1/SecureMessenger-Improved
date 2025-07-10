import { useState } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CalculatorLoginProps {
  onLoginSuccess: () => void;
}

export default function CalculatorLogin({ onLoginSuccess }: CalculatorLoginProps) {
  const [currentInput, setCurrentInput] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/login", { code });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Connexion réussie",
          description: data.message,
        });
        onLoginSuccess();
      } else {
        handleLoginError(data.message);
      }
    },
    onError: (error) => {
      handleLoginError("Erreur de connexion");
    },
  });

  const handleLoginError = (message: string) => {
    setIsShaking(true);
    toast({
      title: "Erreur",
      description: message,
      variant: "destructive",
    });
    setTimeout(() => {
      setIsShaking(false);
      setCurrentInput("");
    }, 1000);
  };

  const appendToDisplay = (value: string) => {
    if (currentInput.length < 10) {
      setCurrentInput(prev => prev + value);
    }
  };

  const clearDisplay = () => {
    setCurrentInput("");
  };

  const validateCode = () => {
    if (currentInput === "") {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un code",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(currentInput);
  };

  const displayText = loginMutation.isSuccess 
    ? "Accès autorisé" 
    : loginMutation.isError 
    ? "Code incorrect" 
    : currentInput || "0";

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-100 to-gray-200">
      <motion.div
        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm"
        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Calculator Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Secure Chat</h1>
          <p className="text-gray-600 text-sm">Entrez votre code d'accès</p>
        </div>

        {/* Calculator Display */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6">
          <div className="text-right text-white font-mono text-2xl min-h-[40px] flex items-center justify-end">
            <span>{displayText}</span>
          </div>
        </div>

        {/* Calculator Keypad */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {/* Numbers 1-9 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <motion.button
              key={num}
              className="bg-gray-100 hover:bg-gray-200 rounded-xl h-14 text-xl font-semibold text-gray-800 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => appendToDisplay(num.toString())}
              disabled={loginMutation.isPending}
            >
              {num}
            </motion.button>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-3 gap-3">
          <motion.button
            className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-14 text-lg font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearDisplay}
            disabled={loginMutation.isPending}
          >
            C
          </motion.button>
          <motion.button
            className="bg-gray-100 hover:bg-gray-200 rounded-xl h-14 text-xl font-semibold text-gray-800 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("0")}
            disabled={loginMutation.isPending}
          >
            0
          </motion.button>
          <motion.button
            className="bg-green-500 hover:bg-green-600 text-white rounded-xl h-14 text-lg font-semibold transition-all duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={validateCode}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "..." : "✓"}
          </motion.button>
        </div>

        {/* Demo codes info */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Codes de démonstration:</p>
          <p>1234, 5678, 9999, 0000</p>
        </div>
      </motion.div>
    </div>
  );
}
