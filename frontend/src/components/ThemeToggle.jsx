import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { motion } from "framer-motion";

const ThemeToggle = () => {
  const { dark, setDark } = useContext(ThemeContext);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative flex items-center w-16 h-8 p-1 rounded-full transition-colors duration-500 focus:outline-none shadow-inner"
      style={{
        backgroundColor: dark ? "#1e293b" : "#cbd5e1",
      }}
      aria-label="Toggle Theme"
    >
      {/* Sliding Circle */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className="z-10 flex items-center justify-center w-6 h-6 bg-white rounded-full shadow-md"
        animate={{ x: dark ? 32 : 0 }}
      >
        {dark ? (
          <span className="text-[10px]">🌙</span>
        ) : (
          <span className="text-[10px]">☀️</span>
        )}
      </motion.div>

      {/* Background Icons for depth */}
      <div className="absolute inset-0 flex justify-between items-center px-2 text-[10px] select-none">
        <span className={dark ? "opacity-20" : "opacity-100"}>☀️</span>
        <span className={dark ? "opacity-100" : "opacity-20"}>🌙</span>
      </div>
    </button>
  );
};

export default ThemeToggle;