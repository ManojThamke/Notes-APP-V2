import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";
import { motion, AnimatePresence } from "framer-motion";

const medals = ["🏆", "🥈", "🥉"];
const colors = ["from-yellow-400 to-yellow-600", "from-gray-300 to-gray-500", "from-orange-400 to-orange-600"];

const TopScholars = () => {
    const [scholars, setScholars] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTopScholars = async () => {
            if (!window.ethereum) return;
            try {
                const provider = new ethers.providers.Web3Provider(window.ethereum);
                const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, provider);
                const allNotes = await contract.getAllNotes();

                // Aggregate stats by uploader
                const userStats = {};
                allNotes.forEach(note => {
                    const uploader = note.uploader.toLowerCase();
                    if (!userStats[uploader]) {
                        userStats[uploader] = { downloads: 0, upvotes: 0, uploads: 0 };
                    }
                    userStats[uploader].downloads += parseInt(note.downloads.toString());
                    userStats[uploader].upvotes += parseInt(note.upvotes ? note.upvotes.toString() : "0");
                    userStats[uploader].uploads += 1;
                });

                // Calculate a score: 10 pts per upvote, 2 pts per download, 5 pts per upload
                const rankings = Object.keys(userStats).map(address => {
                    const stats = userStats[address];
                    const score = (stats.upvotes * 10) + (stats.downloads * 2) + (stats.uploads * 5);
                    return { address, ...stats, score };
                });

                // Sort by score descending and take top 3
                rankings.sort((a, b) => b.score - a.score);
                setScholars(rankings.slice(0, 3));
            } catch (error) {
                console.error("Failed to load top scholars:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTopScholars();
    }, []);

    if (loading || scholars.length === 0) return null;

    return (
        <section className="max-w-4xl mx-auto py-12 px-4">
            <div className="text-center mb-10">
                <span className="px-4 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 text-xs font-bold uppercase tracking-widest mb-4 inline-block">
                    Leaderboard
                </span>
                <h3 className="text-4xl tracking-tight font-black text-gray-900 dark:text-white">Top Scholars</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">The highest-ranked contributors in the ecosystem</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AnimatePresence>
                    {scholars.map((scholar, index) => (
                        <motion.div
                            key={scholar.address}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 flex flex-col items-center justify-center rounded-[2.5rem] shadow-xl overflow-hidden`}
                        >
                            {/* Medals Background Element */}
                            <div className={`absolute -top-6 -right-6 text-7xl opacity-5 dark:opacity-10 pointer-events-none`}>
                                {medals[index]}
                            </div>

                            <div className="text-5xl drop-shadow-md mb-2">{medals[index]}</div>
                            <h4 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${colors[index]} mb-1`}>
                                Rank {index + 1}
                            </h4>
                            <div className="text-sm font-mono text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-black/40 px-3 py-1 rounded-md mb-4 border border-gray-200 dark:border-white/5 shadow-inner">
                                {scholar.address.slice(0, 6)}...{scholar.address.slice(-4)}
                            </div>

                            <div className="flex gap-4 text-center mt-2 w-full justify-center">
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{scholar.downloads}</div>
                                    <div className="text-[10px] uppercase text-gray-500 font-bold tracking-widest">Downs</div>
                                </div>
                                <div className="w-[1px] bg-gray-200 dark:bg-white/10" />
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{scholar.upvotes}</div>
                                    <div className="text-[10px] uppercase text-yellow-500 font-bold tracking-widest">Upvotes</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
};

export default TopScholars;
