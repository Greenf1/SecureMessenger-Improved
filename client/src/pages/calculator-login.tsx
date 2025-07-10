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
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-gray-900 to-gray-800 flex flex-col overflow-hidden">
      {/* Modern Calculator Header */}
      <div className="flex items-center justify-between p-6 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
        <div className="text-white/60 text-sm font-medium">Calculatrice</div>
        <div className="w-12"></div>
      </div>

      {/* Calculator Body */}
      <div className="flex-1 flex flex-col p-8 pt-4">
        {/* Display Area */}
        <motion.div
          className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-8 mb-8 border border-gray-700/50 shadow-2xl"
          animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
          transition={{ duration: 0.6 }}
        >
          <div className="text-right text-white font-mono text-5xl min-h-[80px] flex items-center justify-end">
            <span className="truncate drop-shadow-lg">{displayText}</span>
          </div>
        </motion.div>

        {/* Keypad */}
        <div className="grid grid-cols-4 gap-4 flex-1">
          {/* Row 1 */}
          <motion.button
            className="bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-2xl text-xl font-semibold transition-all duration-200 shadow-xl col-span-2 flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={clearDisplay}
            disabled={loginMutation.isPending}
          >
            AC
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white rounded-2xl text-xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={deleteLast}
            disabled={loginMutation.isPending}
          >
            ⌫
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl text-3xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,165,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendOperation("/")}
            disabled={loginMutation.isPending}
          >
            ÷
          </motion.button>

          {/* Row 2 */}
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("7")}
            disabled={loginMutation.isPending}
          >
            7
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("8")}
            disabled={loginMutation.isPending}
          >
            8
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("9")}
            disabled={loginMutation.isPending}
          >
            9
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl text-3xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,165,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendOperation("*")}
            disabled={loginMutation.isPending}
          >
            ×
          </motion.button>

          {/* Row 3 */}
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("4")}
            disabled={loginMutation.isPending}
          >
            4
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("5")}
            disabled={loginMutation.isPending}
          >
            5
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("6")}
            disabled={loginMutation.isPending}
          >
            6
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl text-3xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,165,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendOperation("-")}
            disabled={loginMutation.isPending}
          >
            −
          </motion.button>

          {/* Row 4 */}
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("1")}
            disabled={loginMutation.isPending}
          >
            1
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("2")}
            disabled={loginMutation.isPending}
          >
            2
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("3")}
            disabled={loginMutation.isPending}
          >
            3
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl text-3xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,165,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendOperation("+")}
            disabled={loginMutation.isPending}
          >
            +
          </motion.button>

          {/* Row 5 */}
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl col-span-2 flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay("0")}
            disabled={loginMutation.isPending}
          >
            0
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-2xl text-2xl font-semibold transition-all duration-200 shadow-xl flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => appendToDisplay(".")}
            disabled={loginMutation.isPending}
          >
            .
          </motion.button>
          <motion.button
            className="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-2xl text-3xl font-semibold transition-all duration-200 shadow-xl disabled:opacity-50 flex items-center justify-center"
            whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(255,165,0,0.3)" }}
            whileTap={{ scale: 0.98 }}
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
