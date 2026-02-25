import { useContext, useEffect, useState } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";

const UserStats = () => {
    const { account, balance } = useContext(Web3Context);
    const [stats, setStats] = useState({ uploaded: 0, totalDownloads: 0 });

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!account || !window.ethereum) return;
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, provider);
                const allNotes = await contract.getAllNotes();

                let uploadedCount = 0;
                let downloadsCount = 0;

                allNotes.forEach(note => {
                    if (note.uploader.toLowerCase() === account.toLowerCase()) {
                        uploadedCount++;
                        downloadsCount += note.downloads ? parseInt(note.downloads.toString()) : 0;
                    }
                });

                setStats({ uploaded: uploadedCount, totalDownloads: downloadsCount });
            } catch (error) {
                console.error("Error fetching user stats:", error);
            }
        };

        fetchUserStats();

        // Listen for NoteUploaded and NoteDownloaded events to refresh stats ideally, or just pull on mount
    }, [account]);

    if (!account) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto mt-6 mb-16 p-8 rounded-3xl bg-white/60 dark:bg-gradient-to-br dark:from-indigo-900/40 dark:via-[#1e1a3b]/60 dark:to-purple-900/40 border border-indigo-200 dark:border-indigo-500/20 shadow-xl dark:shadow-2xl backdrop-blur-xl"
        >
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                    <h3 className="text-3xl font-black text-indigo-900 dark:text-white mb-2 tracking-tight">Your Dashboard</h3>
                    <p className="text-indigo-600 dark:text-indigo-200/60 font-medium">Track your academic contributions</p>
                </div>

                <div className="flex flex-wrap justify-center gap-6 w-full md:w-auto">
                    {/* Stat Card 1 */}
                    <div className="flex flex-col bg-white/50 dark:bg-black/40 px-6 py-4 rounded-2xl border border-indigo-100 dark:border-white/5 w-auto min-w-[140px] items-center text-center shadow-inner">
                        <span className="text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1">Uploaded</span>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.uploaded}</span>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="flex flex-col bg-white/50 dark:bg-black/40 px-6 py-4 rounded-2xl border border-indigo-100 dark:border-white/5 w-auto min-w-[140px] items-center text-center shadow-inner">
                        <span className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest mb-1">Downloads</span>
                        <span className="text-3xl font-black text-gray-900 dark:text-white">{stats.totalDownloads}</span>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="flex flex-col bg-gradient-to-br from-blue-100/50 to-purple-100/50 dark:from-blue-600/20 dark:to-purple-600/20 px-6 py-4 rounded-2xl border border-blue-300 dark:border-blue-500/30 w-auto min-w-[160px] items-center text-center shadow-[0_0_15px_rgba(59,130,246,0.1)] dark:shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <span className="text-blue-600 dark:text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">NTK Earned</span>
                        <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">{balance}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default UserStats;
