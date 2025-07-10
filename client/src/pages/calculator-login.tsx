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
    } else if (currentInput.length < 12) {
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
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        className="bg-black rounded-3xl shadow-2xl p-6 w-full max-w-md border border-gray-700"
        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.6 }}
      >
        {/* Calculator Display */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-6 border border-gray-700">
          <div className="text-right text-white font-mono text-3xl min-h-[50px] flex items-center justify-end">
            <span className="truncate">{displayText}</span>
          </div>
        </div>

        {/* Calculator Keypad */}
        <div className="grid grid-cols-4 gap-3">
          {/* First Row */}
          <motion.button
            className="bg-gray-600 hover:bg-gray-500 text-white rounded-xl h-16 text-lg font-semibold transition-all duration-200 col-span-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearDisplay}
            disabled={loginMutation.isPending}
          >
            AC
          </motion.button>
          <motion.button
            className="bg-gray-600 hover:bg-gray-500 text-white rounded-xl h-16 text-lg font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={deleteLast}
            disabled={loginMutation.isPending}
          >
            ⌫
          </motion.button>
          <motion.button
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-16 text-2xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("/")}
            disabled={loginMutation.isPending}
          >
            ÷
          </motion.button>

          {/* Second Row */}
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("7")}
            disabled={loginMutation.isPending}
          >
            7
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("8")}
            disabled={loginMutation.isPending}
          >
            8
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("9")}
            disabled={loginMutation.isPending}
          >
            9
          </motion.button>
          <motion.button
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-16 text-2xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("*")}
            disabled={loginMutation.isPending}
          >
            ×
          </motion.button>

          {/* Third Row */}
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("4")}
            disabled={loginMutation.isPending}
          >
            4
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("5")}
            disabled={loginMutation.isPending}
          >
            5
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("6")}
            disabled={loginMutation.isPending}
          >
            6
          </motion.button>
          <motion.button
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-16 text-2xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("-")}
            disabled={loginMutation.isPending}
          >
            −
          </motion.button>

          {/* Fourth Row */}
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("1")}
            disabled={loginMutation.isPending}
          >
            1
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("2")}
            disabled={loginMutation.isPending}
          >
            2
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("3")}
            disabled={loginMutation.isPending}
          >
            3
          </motion.button>
          <motion.button
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-16 text-2xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendOperation("+")}
            disabled={loginMutation.isPending}
          >
            +
          </motion.button>

          {/* Fifth Row */}
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200 col-span-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay("0")}
            disabled={loginMutation.isPending}
          >
            0
          </motion.button>
          <motion.button
            className="bg-gray-700 hover:bg-gray-600 text-white rounded-xl h-16 text-xl font-semibold transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => appendToDisplay(".")}
            disabled={loginMutation.isPending}
          >
            .
          </motion.button>
          <motion.button
            className="bg-orange-500 hover:bg-orange-400 text-white rounded-xl h-16 text-2xl font-semibold transition-all duration-200 disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={calculate}
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "..." : "="}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
