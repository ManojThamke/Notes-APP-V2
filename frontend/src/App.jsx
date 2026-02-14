import Layout from "./components/Layout";
import UploadNote from "./components/UploadNote";
import AllNotes from "./components/AllNotes";
import { motion } from "framer-motion";

function App() {
  return (
    <Layout>
      {/* 1. Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mt-12 mb-16"
      >
        <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          The Future of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 animate-gradient">
            Academic Sharing
          </span>
        </h2>

        <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          A decentralized ecosystem where your knowledge is secured by 
          <span className="text-blue-500 font-semibold"> IPFS</span> and rewarded with 
          <span className="text-purple-500 font-semibold"> NTK Tokens</span>.
        </p>

        <div className="mt-10 flex justify-center gap-4">
           <a href="#explore" className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
             Explore Notes
           </a>
           <a href="#upload" className="px-8 py-3 bg-white/5 border border-white/10 dark:text-white rounded-2xl font-bold hover:bg-white/10 transition-all">
             How it Works
           </a>
        </div>
      </motion.div>

      {/* 2. Interactive Sections Container */}
      <div className="space-y-24">
        
        {/* Upload Section with "Upload" ID for navigation */}
        <section id="upload" className="relative">
          <div className="absolute inset-0 bg-blue-500/5 blur-[100px] -z-10" />
          <UploadNote />
        </section>

        {/* Divider */}
        <div className="max-w-4xl mx-auto h-[1px] bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-800 to-transparent" />

        {/* Gallery Section with "Explore" ID */}
        <section id="explore" className="pb-20">
          <div className="flex flex-col items-center mb-10">
            <span className="px-4 py-1 rounded-full bg-blue-500/10 text-blue-500 text-xs font-bold uppercase tracking-widest mb-4">
              Community Ledger
            </span>
            <h3 className="text-3xl font-bold dark:text-white">Recent Uploads</h3>
          </div>
          <AllNotes />
        </section>

      </div>
    </Layout>
  );
}

export default App;