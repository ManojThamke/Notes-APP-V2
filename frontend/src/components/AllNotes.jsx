import { useEffect, useState, useMemo, useCallback } from "react";
import { ethers } from "ethers";
import { motion, AnimatePresence } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";

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
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

      const tx = await contract.downloadNote(blockchainId);
      await tx.wait();

      window.open(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`, "_blank");
      fetchNotes(); 
    } catch (error) {
      console.error("Download error:", error);
      alert("Retrieve failed. Ensure you have enough gas and are on the right network.");
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
          <h2 className="text-4xl font-black text-white mb-2">Resource Library</h2>
          <p className="text-gray-400">Secure Peer-to-Peer Academic Storage</p>
        </div>
        <div className="relative w-full md:w-96">
          <input
            type="text"
            placeholder="Search notes..."
            className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-2xl text-white outline-none focus:border-blue-500 transition-all"
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
            className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-bold transition-all ${
              activeCategory === cat ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
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
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2.5rem] shadow-2xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-2xl">📄</span>
                      <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase">{note.category}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 leading-snug">{note.title}</h3>
                    <p className="text-gray-500 text-xs font-mono mb-6 italic">By: {note.uploader.slice(0, 6)}...{note.uploader.slice(-4)}</p>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-xs text-gray-400 font-bold">📥 {note.downloads} Downloads</div>
                    <button
                      onClick={() => handleDownload(note.blockchainId, note.ipfsHash)}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-5 py-2.5 rounded-xl font-bold transition-all"
                    >
                      Retrieve
                    </button>
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