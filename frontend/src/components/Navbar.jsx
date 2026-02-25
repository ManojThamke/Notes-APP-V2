import { useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { motion } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { ethers } from "ethers";
import toast from "react-hot-toast";

const Navbar = () => {
    const { account, balance, connectWallet } = useContext(Web3Context);

    const requestTestETH = async () => {
        if (!account) return;

        // Check if this account has already used the faucet
        const storageKey = `faucet_used_${account.toLowerCase()}`;
        if (localStorage.getItem(storageKey)) {
            return toast.error("You have already claimed your free test ETH!");
        }

        const toastId = toast.loading("Requesting Test ETH...");
        try {
            // Public test development private key from Hardhat Node
            const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
            const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
            const wallet = new ethers.Wallet(privateKey, provider);

            const tx = await wallet.sendTransaction({
                to: account,
                value: ethers.utils.parseEther("10.0")
            });
            await tx.wait();

            // Mark as used
            localStorage.setItem(storageKey, "true");
            toast.success("10 ETH received! You can now pay for gas.", { id: toastId });
        } catch (e) {
            console.error(e);
            toast.error("Faucet failed. Is your hardhat node active?", { id: toastId });
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                className="w-full max-w-6xl flex justify-between items-center px-6 py-3 rounded-2xl border border-gray-200/50 dark:border-white/10 backdrop-blur-xl bg-white/70 dark:bg-black/40 shadow-xl shadow-blue-900/5"
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
                        <div className="hidden sm:flex items-center gap-3 bg-white/30 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl">
                            {/* Status Indicator */}
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_#4ade80]" />

                            <div className="text-sm font-medium flex items-center">
                                <span className="text-gray-500 dark:text-gray-400 mr-2 border-r border-gray-300 dark:border-gray-700 pr-2">Wallet</span>
                                <span className="text-indigo-600 dark:text-white font-mono font-bold tracking-tight">
                                    {account.slice(0, 6)}...{account.slice(-4)}
                                </span>
                            </div>

                            <button
                                onClick={requestTestETH}
                                className="text-xs bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50 px-2 py-1 rounded-md transition-colors"
                                title="Get Free Test ETH for Gas"
                            >
                                💧 Faucet
                            </button>

                            <div className="h-4 w-[1px] bg-gray-300 dark:bg-white/10 mx-1" />

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

                    <div className="h-8 w-[1px] bg-gray-200 dark:bg-white/10" />

                    <ThemeToggle />
                </div>
            </motion.nav>
        </div>
    );
};

export default Navbar;