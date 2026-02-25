import { useContext, useState, useEffect } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";
import toast from "react-hot-toast";

const StakingDashboard = () => {
    const { account, balance } = useContext(Web3Context);
    const [stakedAmount, setStakedAmount] = useState("0");
    const [pendingRewards, setPendingRewards] = useState("0");
    const [stakeInput, setStakeInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const fetchStakingData = async () => {
        if (!account || !window.ethereum) return;
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, provider);

            const stakeInfo = await contract.userStakes(account);
            setStakedAmount(ethers.utils.formatEther(stakeInfo.amount));

            const currentRwds = await contract.getPendingRewards(account);
            setPendingRewards(ethers.utils.formatEther(currentRwds));
        } catch (error) {
            console.error("Failed to fetch staking data", error);
        }
    };

    // Live counter effect
    useEffect(() => {
        fetchStakingData();
        const interval = setInterval(fetchStakingData, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, [account]);

    const handleStake = async () => {
        if (!stakeInput || isNaN(stakeInput) || parseFloat(stakeInput) <= 0) return toast.error("Enter a valid amount to stake.");
        if (parseFloat(stakeInput) > parseFloat(balance)) return toast.error("Insufficient NTK balance.");

        setIsLoading(true);
        const toastId = toast.loading("Processing Stake...");
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

            const tx = await contract.stakeNTK(ethers.utils.parseEther(stakeInput));

            toast.loading("Transaction pending...", { id: toastId });
            await tx.wait();

            toast.success(`Successfully staked ${stakeInput} NTK!`, { id: toastId });
            setStakeInput("");
            fetchStakingData();
        } catch (error) {
            console.error("Stake error:", error);
            toast.error("Staking failed.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUnstake = async () => {
        if (parseFloat(stakedAmount) <= 0) return toast.error("You have nothing staked.");

        setIsLoading(true);
        const toastId = toast.loading("Unstaking and Claiming Rewards...");
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

            const tx = await contract.unstakeNTK();

            toast.loading("Transaction pending...", { id: toastId });
            await tx.wait();

            toast.success(`Unstaked! Rewards claimed successfully.`, { id: toastId, icon: "💰" });
            fetchStakingData();
        } catch (error) {
            console.error("Unstake error:", error);
            toast.error("Unstaking failed.", { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto mb-16 p-8 rounded-3xl bg-white/60 dark:bg-black/40 border border-purple-200 dark:border-purple-500/20 shadow-xl dark:shadow-[0_0_50px_rgba(168,85,247,0.1)] backdrop-blur-xl relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-10 relative z-10">

                {/* Info Text */}
                <div className="flex-1">
                    <span className="px-4 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                        DeFi Staking
                    </span>
                    <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Earn Passive Yield</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm text-sm">
                        Lock up your NTK tokens in the decentralized vault pool to earn a massive <strong className="text-purple-500">1% per minute</strong> dynamic interest rate!
                        <br /><br />
                        <span className="text-red-500 font-bold block bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                            ⚠️ 10 MINUTE LOCKUP: Unstaking before 10 minutes will BURN 20% of your deposit and forfeit all rewards.
                        </span>
                    </p>

                    <div className="bg-white/50 dark:bg-black/30 w-full p-4 flex justify-between rounded-xl border border-gray-200 dark:border-white/5 mb-6 shadow-inner">
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Total Staked</div>
                            <div className="text-2xl font-black text-gray-900 dark:text-white">{stakedAmount} <span className="text-sm font-normal text-purple-600">NTK</span></div>
                        </div>
                        <div className="w-px bg-gray-300 dark:bg-white/10" />
                        <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest mb-1">Live Rewards 💸</div>
                            <motion.div
                                key={pendingRewards}
                                initial={{ y: -10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"
                            >
                                +{pendingRewards} <span className="text-sm font-normal">NTK</span>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Interactive Controls */}
                <div className="flex-1 bg-white/40 dark:bg-white/5 p-6 rounded-2xl border border-gray-200 dark:border-white/5 shadow-md flex flex-col justify-center">

                    <div className="mb-4">
                        <label className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 block">Amount to Stake</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={stakeInput}
                                onChange={(e) => setStakeInput(e.target.value)}
                                placeholder="0.0"
                                className="w-full bg-white dark:bg-black/40 border border-gray-300 dark:border-white/10 p-3 pr-16 rounded-xl text-gray-900 dark:text-white outline-none focus:border-purple-500 transition-all shadow-inner font-mono font-bold"
                            />
                            <button
                                onClick={() => setStakeInput(balance)}
                                className="absolute right-2 top-2 text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-1.5 rounded-lg font-bold hover:bg-purple-200 transition-colors"
                            >
                                MAX
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleStake}
                            disabled={isLoading}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? "Wait..." : "Stake NTK"}
                        </button>
                        <button
                            onClick={handleUnstake}
                            disabled={isLoading || parseFloat(stakedAmount) <= 0}
                            className={`flex-1 font-black py-3 rounded-xl transition-all shadow-inner active:scale-95 flex flex-col items-center justify-center
                                ${parseFloat(stakedAmount) > 0
                                    ? parseFloat(pendingRewards) == 0
                                        ? "bg-red-500 text-white hover:bg-red-600 shadow-[0_0_15px_rgba(239,68,68,0.4)]" // Style red if still in penalty
                                        : "bg-gradient-to-r from-pink-500 to-orange-400 text-white hover:shadow-[0_0_15px_rgba(236,72,153,0.4)] border-none"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed border-none"
                                }`}
                        >
                            <span>Claim & Unstake</span>
                            {parseFloat(stakedAmount) > 0 && parseFloat(pendingRewards) == 0 && (
                                <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1">20% Penalty Active</span>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default StakingDashboard;
