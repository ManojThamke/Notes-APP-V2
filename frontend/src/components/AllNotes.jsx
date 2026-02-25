import { useEffect, useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";
import toast from "react-hot-toast";

const AllNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];

  // 🛠️ USECALLBACK for stable fetch reference
  const fetchNotes = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      // Verify contract address exists before creating instance
      if (!NOTES_ADDRESS || NOTES_ADDRESS === "0x") {
        console.error("Invalid Contract Address in config");
        return;
      }

      const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, provider);

      // Fetch data
      const allNotes = await contract.getAllNotes();

      // 🛡️ CHECK: Ensure allNotes is an array and not empty
      if (allNotes && allNotes.length > 0) {
        const formattedNotes = allNotes.map((note, index) => ({
          blockchainId: index,
          title: note.title || "Untitled",
          category: note.category || "General",
          ipfsHash: note.ipfsHash,
          uploader: note.uploader,
          // Handle BigNumber conversion safely
          downloads: note.downloads ? note.downloads.toString() : "0",
          upvotes: note.upvotes ? note.upvotes.toString() : "0",
        }));
        setNotes(formattedNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      // 🚨 Detailed logging for debugging CALL_EXCEPTION
      console.error("Fetching Error:", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleDownload = async (blockchainId, ipfsHash) => {
    const toastId = toast.loading("Confirming retrieval...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

      const tx = await contract.downloadNote(blockchainId);

      toast.loading("Transaction pending...", { id: toastId });
      await tx.wait();

      toast.success("Note retrieved successfully!", { id: toastId });
      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, "_blank");
      fetchNotes();
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Retrieve failed. Ensure enough gas.", { id: toastId });
    }
  };

  const handleUpvote = async (blockchainId, uploader) => {
    // Basic verification - cannot upvote own note
    if (window.ethereum && window.ethereum.selectedAddress && window.ethereum.selectedAddress.toLowerCase() === uploader.toLowerCase()) {
      return toast.error("You cannot upvote your own note!");
    }

    const toastId = toast.loading("Processing Upvote (-1 NTK)...");
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

      const tx = await contract.upvoteNote(blockchainId);

      toast.loading("Transaction pending...", { id: toastId });
      await tx.wait();

      toast.success("Note upvoted successfully! 1 NTK tipped.", { id: toastId });
      fetchNotes();
    } catch (error) {
      console.error("Upvote error:", error);
      toast.error("Upvote failed. Ensure you have at least 1 NTK and gas.", { id: toastId });
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter((note) => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "All" || note.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory, notes]);

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">Resource Library</h2>
          <p className="text-gray-500 dark:text-gray-400">Secure Peer-to-Peer Academic Storage</p>
        </div>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-white/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-4 pl-12 rounded-2xl text-gray-900 dark:text-white outline-none focus:border-blue-500 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="absolute left-4 top-4 opacity-40">🔍</span>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-3 mb-10 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${activeCategory === cat ? "bg-blue-600 border border-blue-500 text-white shadow-md shadow-blue-500/20" : "bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode='popLayout'>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <motion.div
                  key={note.ipfsHash + note.blockchainId}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-6 rounded-[2.5rem] shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl group-hover:scale-110 transition-transform">📄</span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-400/10 px-3 py-1 rounded-full uppercase">{note.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 leading-snug">{note.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-mono mb-6 italic">By: {note.uploader.slice(0, 6)}...{note.uploader.slice(-4)}</p>
                  </div>
                  <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-white/5">
                    <div className="flex justify-between items-center w-full">
                      <div className="text-xs text-gray-500 dark:text-gray-400 font-bold">📥 {note.downloads} Downloads</div>
                      <div className="text-xs font-bold text-yellow-500/80 bg-yellow-500/10 px-2 py-1 rounded-md">
                        ⭐ {note.upvotes}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpvote(note.blockchainId, note.uploader)}
                        className="flex-1 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 hover:border-yellow-500/50 text-xs px-2 py-2.5 rounded-xl font-bold transition-all shadow-sm active:scale-95"
                      >
                        ⭐ Upvote
                      </button>
                      <button
                        onClick={() => handleDownload(note.blockchainId, note.ipfsHash)}
                        className="flex-1 bg-gray-900 dark:bg-blue-600 hover:bg-gray-800 dark:hover:bg-blue-500 text-white text-xs px-2 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95"
                      >
                        Retrieve
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-400 italic">No notes found in this section.</div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default AllNotes;