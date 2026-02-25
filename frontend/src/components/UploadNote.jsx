import { useState, useContext } from "react";
import { Web3Context } from "../context/Web3Context";
import { ethers } from "ethers";
import axios from "axios";
import { motion } from "framer-motion";
import { NOTES_ADDRESS } from "../contracts/contractConfig";
import notesArtifact from "../contracts/NotesStorageABI.json";
import toast from "react-hot-toast";

const UploadNote = () => {
  const { account } = useContext(Web3Context);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Computer Science"); // 🆕 New state
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Define subjects matching your AllNotes filter tabs
  const subjects = ["Computer Science", "Information Technology", "Electronics", "Mechanical", "Civil"];

  const uploadNote = async () => {
    if (!account) return toast.error("Connect wallet first!");
    if (!file) return toast.error("Select a PDF file to upload.");
    if (!title) return toast.error("Please provide a title.");

    const toastId = toast.loading("Uploading to IPFS & Blockchain...");

    try {
      setLoading(true);

      // 1️⃣ IPFS Upload
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}` },
      });

      const ipfsHash = res.data.IpfsHash;

      // 2️⃣ Blockchain Transaction
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NOTES_ADDRESS, notesArtifact.abi, signer);

      // 🆕 Updated to include 'category' in the arguments
      const tx = await contract.uploadNote(title, category, ipfsHash);
      await tx.wait();

      toast.success("Note Published to Blockchain!", { id: toastId });
      setTitle("");
      setFile(null);
      setLoading(false);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Transaction Failed. Check console.", { id: toastId });
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto mt-16 p-8 bg-white/80 dark:bg-gray-900/50 backdrop-blur-2xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
    >
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black text-gray-900 dark:text-white mb-1 tracking-tight">Push to Chain</h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm border-b border-gray-200 dark:border-white/10 inline-block pb-2">Immutable academic storage</p>
      </div>

      <div className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] ml-2">Document Title</label>
          <input
            type="text"
            placeholder="e.g. Data Structures Unit 1"
            className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-inner"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* 🆕 Category Selection */}
        <div>
          <label className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] ml-2">Department</label>
          <select
            className="w-full mt-2 p-4 rounded-2xl bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white focus:border-purple-500 outline-none cursor-pointer shadow-inner"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                {sub}
              </option>
            ))}
          </select>
        </div>

        {/* File Dropzone */}
        <div className="relative border-2 border-dashed border-gray-300 dark:border-white/10 rounded-2xl p-8 text-center hover:border-blue-500 transition-all cursor-pointer bg-gray-50 dark:bg-white/5 group">
          <input
            type="file"
            accept=".pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <div className="text-gray-500 dark:text-gray-400">
            <span className="block text-4xl mb-3 group-hover:scale-110 transition-transform">📄</span>
            {file ? (
              <span className="text-blue-600 dark:text-blue-400 font-bold text-sm truncate block px-2">{file.name}</span>
            ) : (
              <span className="text-xs uppercase font-bold tracking-widest text-gray-600 dark:text-gray-400">Select PDF File</span>
            )}
          </div>
        </div>

        <button
          onClick={uploadNote}
          disabled={loading}
          className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl ${loading
            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-blue-500/20 hover:scale-[1.02] active:scale-95"
            }`}
        >
          {loading ? "Processing Transaction..." : "Deploy to Network"}
        </button>
      </div>
    </motion.div>
  );
};

export default UploadNote;