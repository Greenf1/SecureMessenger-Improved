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
  const [previousInput, setPreviousInput] = useState("");
  const [operation, setOperation] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", "/api/login", { code });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        onLoginSuccess();
      } else {
        // Si ce n'est pas un code valide, traiter comme un calcul
        handleCalculation();
      }
    },
    onError: (error) => {
      // En cas d'erreur, traiter comme un calcul
      handleCalculation();
    },
  });

  const handleCalculation = () => {
    try {
      // Évaluer l'expression mathématique
      const result = eval(currentInput);
      setCurrentInput(result.toString());
      setPreviousInput("");
      setOperation("");
    } catch (error) {
      setCurrentInput("Erreur");
      setTimeout(() => setCurrentInput(""), 1000);
    }
  };

  const appendToDisplay = (value: string) => {
    if (currentInput === "Erreur") {
      setCurrentInput(value);
    } else if (currentInput.length < 15) {
      setCurrentInput(prev => prev + value);
    }
  };

  const appendOperation = (op: string) => {
    if (currentInput === "") return;
    
    if (previousInput !== "" && operation !== "") {
      // Calculer le résultat précédent
      try {
        const result = eval(previousInput + operation + currentInput);
        setPreviousInput(result.toString());
        setCurrentInput("");
        setOperation(op);
      } catch (error) {
        setCurrentInput("Erreur");
        setTimeout(() => setCurrentInput(""), 1000);
      }
    } else {
      setPreviousInput(currentInput);
      setCurrentInput("");
      setOperation(op);
    }
  };

  const clearDisplay = () => {
    setCurrentInput("");
    setPreviousInput("");
    setOperation("");
  };

  const calculate = () => {
    if (currentInput === "") return;
    
    // D'abord, vérifier si c'est un code d'accès valide
    const validCodes = ["1234", "5678", "9999", "0000", "1111", "2222"];
    if (validCodes.includes(currentInput)) {
      loginMutation.mutate(currentInput);
      return;
    }
    
    // Sinon, calculer le résultat
    if (previousInput !== "" && operation !== "") {
      try {
        const result = eval(previousInput + operation + currentInput);
        setCurrentInput(result.toString());
        setPreviousInput("");
        setOperation("");
      } catch (error) {
        setCurrentInput("Erreur");
        setTimeout(() => setCurrentInput(""), 1000);
      }
    } else {
      // Si c'est juste un nombre, vérifier si c'est un code
      loginMutation.mutate(currentInput);
    }
  };

  const deleteLast = () => {
    if (currentInput.length > 0) {
      setCurrentInput(prev => prev.slice(0, -1));
    }
  };

  const displayText = currentInput || (previousInput && operation ? previousInput + operation : "0");

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex flex-col overflow-hidden">
      {/* Modern Calculator Header */}
      <div className="flex items-center justify-between p-8 bg-black/10 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-4">
          <div className="w-5 h-5 bg-red-500 rounded-full shadow-lg"></div>
          <div className="w-5 h-5 bg-yellow-400 rounded-full shadow-lg"></div>
          <div className="w-5 h-5 bg-green-500 rounded-full shadow-lg"></div>
        </div>
        <div className="text-white/80 text-lg font-medium tracking-wide">Calculatrice Pro</div>
        <div className="w-16"></div>
      </div>

      {/* Calculator Body */}
      <div className="flex-1 flex flex-col p-12 pt-8 max-w-lg mx-auto w-full">
        {/* Display Area */}
        <motion.div
          className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-[2rem] p-10 mb-12 border border-white/20 shadow-2xl backdrop-blur-lg"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="text-right text-white font-mono text-6xl min-h-[100px] flex items-center justify-end">
            <span className="truncate drop-shadow-2xl">{displayText}</span>
          </div>
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-6 flex-1">
          {/* Row 1 */}
          <motion.button
            className="bg-gradient-to-br from-slate-600/80 to-slate-700/80 hover:from-slate-500/80 hover:to-slate-600/80 text-white rounded-3xl text-xl font-semibold transition-all duration-300 shadow-2xl col-span-2 flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(148, 163, 184, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={clearDisplay}
            disabled={loginMutation.isPending}
          >
            AC
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-600/80 to-slate-700/80 hover:from-slate-500/80 hover:to-slate-600/80 text-white rounded-3xl text-xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(148, 163, 184, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={deleteLast}
            disabled={loginMutation.isPending}
          >
            ⌫
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-3xl text-3xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("/")}
            disabled={loginMutation.isPending}
          >
            ÷
          </motion.button>

          {/* Row 2 */}
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("7")}
            disabled={loginMutation.isPending}
          >
            7
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("8")}
            disabled={loginMutation.isPending}
          >
            8
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("9")}
            disabled={loginMutation.isPending}
          >
            9
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-3xl text-3xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("*")}
            disabled={loginMutation.isPending}
          >
            ×
          </motion.button>

          {/* Row 3 */}
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("4")}
            disabled={loginMutation.isPending}
          >
            4
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("5")}
            disabled={loginMutation.isPending}
          >
            5
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("6")}
            disabled={loginMutation.isPending}
          >
            6
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-3xl text-3xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("-")}
            disabled={loginMutation.isPending}
          >
            −
          </motion.button>

          {/* Row 4 */}
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("1")}
            disabled={loginMutation.isPending}
          >
            1
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("2")}
            disabled={loginMutation.isPending}
          >
            2
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("3")}
            disabled={loginMutation.isPending}
          >
            3
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-3xl text-3xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("+")}
            disabled={loginMutation.isPending}
          >
            +
          </motion.button>

          {/* Row 5 */}
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl col-span-2 flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("0")}
            disabled={loginMutation.isPending}
          >
            0
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-slate-700/90 to-slate-800/90 hover:from-slate-600/90 hover:to-slate-700/90 text-white rounded-3xl text-2xl font-semibold transition-all duration-300 shadow-2xl flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/10"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(71, 85, 105, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay(".")}
            disabled={loginMutation.isPending}
          >
            .
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-3xl text-3xl font-semibold transition-all duration-300 shadow-2xl disabled:opacity-50 flex items-center justify-center min-h-[70px] backdrop-blur-sm border border-white/20"
            whileHover={{ scale: 1.05, boxShadow: "0 25px 50px rgba(16, 185, 129, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            onClick={calculate}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              "="
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
