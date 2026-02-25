import { useContext, useState, useEffect } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";
import toast from "react-hot-toast";

const SpinWheel = () => {
    const { account, balance } = useContext(Web3Context);
    const [isSpinning, setIsSpinning] = useState(false);
    const [lastSpin, setLastSpin] = useState(0);
    const [rotation, setRotation] = useState(0);
    const [reward, setReward] = useState(null);
    const [isOpen, setIsOpen] = useState(false);

    // Refresh user's last spin capability
    useEffect(() => {
        const checkLastSpin = async () => {
            if (!account || !window.ethereum) return;
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, provider);
                const time = await contract.lastSpinTime(account);
                setLastSpin(time.toNumber());
            } catch (error) {
                console.error("Failed to check last spin:", error);
            }
        };
        checkLastSpin();
    }, [account]);

    const canSpin = () => {
        const now = Math.floor(Date.now() / 1000);
        return now >= lastSpin + 86400; // 24 hours
    };

    const handleSpin = async () => {
        if (!account) return toast.error("Connect wallet to play.");
        if (!canSpin()) return toast.error("You can only spin once every 24 hours!");

        setIsSpinning(true);
        setReward(null);
        const toastId = toast.loading("Confirming Daily Spin transaction...");

        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

            const tx = await contract.spinWheel();

            // Spin animation starts while tx is pending
            setRotation(prev => prev + 1440 + Math.random() * 360); // 4 full spins + random stop

            toast.loading("Spinning the wheel on the blockchain...", { id: toastId });
            const receipt = await tx.wait();

            // Find event to get exactly how much was won
            const event = receipt.events.find(e => e.event === 'SpunWheel');
            if (event) {
                const amountWon = ethers.utils.formatEther(event.args.rewardAmount);
                setReward(amountWon);
                toast.success(`Jackpot! You won ${amountWon} NTK!`, { id: toastId, icon: "🎉" });
            } else {
                toast.success("Spin successful! Check your balance.", { id: toastId });
            }

            setLastSpin(Math.floor(Date.now() / 1000));
        } catch (error) {
            console.error("Spin error:", error);
            toast.error("Transaction failed or you rejected it.", { id: toastId });
        } finally {
            setTimeout(() => {
                setIsSpinning(false);
            }, 3000); // give the visual wheel time to finish its CSS spin if tx was instant
        }
    };

    return (
        <>
            {/* The Floating Side Button */}
            <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-gradient-to-l from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-[-5px_0_20px_rgba(16,185,129,0.3)] px-3 py-6 rounded-l-2xl font-black text-xl flex flex-col items-center gap-2 transition-all hover:pr-5 group"
                >
                    <span className="group-hover:animate-spin">🎡</span>
                    <span className="text-xs uppercase tracking-widest" style={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>Daily Spin</span>
                </button>
            </div>

            {/* The Expanding Modal Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="w-full max-w-4xl p-8 rounded-3xl bg-white/90 dark:bg-gray-900/90 border border-green-200 dark:border-green-500/20 shadow-[0_0_100px_rgba(34,197,94,0.2)] backdrop-blur-3xl relative overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Background elements */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/20 blur-[100px] rounded-full pointer-events-none" />

                            <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                                <div className="flex-1">
                                    <span className="px-4 py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                                        Daily Reward Drop
                                    </span>
                                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">Lucky Fortune Wheel</h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
                                        As a member of NotesChain, you get one free spin every 24 hours. Test your luck to earn up to <strong className="text-green-500">50 NTK</strong> instantly!
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={handleSpin}
                                            disabled={isSpinning || !canSpin()}
                                            className={`px-8 py-4 rounded-2xl font-black transition-all shadow-lg active:scale-95 text-lg ${!canSpin()
                                                ? "bg-gray-300 dark:bg-white/5 text-gray-500 dark:text-gray-600 cursor-not-allowed border-none shadow-none"
                                                : "bg-gradient-to-br from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 text-white shadow-green-500/30 dark:shadow-green-500/20"
                                                }`}
                                        >
                                            {isSpinning ? "SPINNING..." : canSpin() ? "SPIN NOW! 🎡" : "COME BACK TOMORROW ⏱️"}
                                        </button>
                                    </div>
                                </div>

                                {/* The Wheel Visual */}
                                <div className="relative w-64 h-64 flex-shrink-0 flex items-center justify-center">
                                    {/* Pointer */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[20px] border-t-green-500 z-10 drop-shadow-md" />

                                    <motion.div
                                        initial={{ rotate: 0 }}
                                        animate={{ rotate: rotation }}
                                        transition={{ duration: 4, type: "tween", ease: "circOut" }}
                                        className="w-full h-full rounded-full border-4 border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden"
                                        style={{
                                            background: "conic-gradient(from 0deg, #10b981 0% 25%, #3b82f6 25% 50%, #8b5cf6 50% 75%, #f59e0b 75% 100%)",
                                            boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)"
                                        }}
                                    >
                                        {/* Inner detail ring */}
                                        <div className="absolute inset-2 border-2 border-white/20 rounded-full border-dashed opacity-50" />

                                        {/* Centered Hub */}
                                        <div className="absolute inset-0 m-auto w-12 h-12 bg-white dark:bg-gray-900 rounded-full shadow-lg border-2 border-white/10 z-0 flex items-center justify-center">
                                            <span className="text-xl">🤑</span>
                                        </div>
                                    </motion.div>

                                    {/* Reward floating animation */}
                                    {reward && !isSpinning && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, y: -40, scale: 1.2 }}
                                            className="absolute inset-0 m-auto w-32 h-16 bg-white dark:bg-gray-800 text-green-500 font-black text-2xl flex items-center justify-center rounded-xl shadow-[0_0_30px_#10b981] z-20 border border-green-400"
                                        >
                                            +{reward} NTK
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SpinWheel;
