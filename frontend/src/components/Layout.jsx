import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#f8fafc] dark:bg-[#030712] transition-colors duration-700">
      
      {/* 1. Background Decorative Blobs (The "Web3" Look) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[35%] h-[35%] rounded-full bg-purple-500/10 blur-[120px] delay-700" />
        <div className="absolute -bottom-[10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[120px]" />
      </div>

      {/* 2. Floating Navbar */}
      <Navbar />

      {/* 3. Main Content Container */}
      <main className="relative z-10 pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.5, 
              ease: [0.22, 1, 0.36, 1] // Custom cubic-bezier for "premium" feel
            }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Subtle Footer (Optional) */}
      <footer className="relative z-10 py-6 text-center text-gray-400 text-xs tracking-widest border-t border-white/5 mx-10">
        POWERED BY ETHEREUM L2 • SECURED BY IPFS
      </footer>
    </div>
  );
};

export default Layout;