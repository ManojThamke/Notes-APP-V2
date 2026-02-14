import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
    const { account, balance, connectWallet } = useContext(Web3Context);

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="w-full max-w-6xl flex justify-between items-center px-6 py-3 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 dark:bg-black/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]"
            >
                {/* Branding Section */}
                <div className="flex items-center gap-2 group cursor-pointer">
                    <div className="bg-blue-600 p-2 rounded-lg group-hover:rotate-12 transition-transform">
                        <span className="text-xl">📚</span>
                    </div>
                    <h1 className="text-xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                        NotesChain
                    </h1>
                </div>

                {/* Account & Utility Section */}
                <div className="flex items-center gap-4">
                    {account ? (
                        <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            {/* Status Indicator */}
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />
                            
                            <div className="text-sm font-medium">
                                <span className="text-gray-400 mr-2">Wallet:</span>
                                <span className="text-white font-mono">
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                            </div>

                            <div className="h-4 w-[1px] bg-white/10 mx-1" />

                            <div className="text-sm">
                                <span className="text-blue-400 font-bold">{balance}</span>
                                <span className="text-xs text-blue-400/70 ml-1 italic">NTK</span>
                            </div>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={connectWallet}
                            className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20"
                        >
                            Connect Wallet
                        </motion.button>
                    )}

                    <div className="h-8 w-[1px] bg-white/10" />
                    
                    <ThemeToggle />
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;