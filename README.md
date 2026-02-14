# 📚 NotesChain: Decentralized Academic Repository

NotesChain is a high-performance Web3 platform designed to decentralize the sharing of academic resources. Built with a focus on **Glassmorphism UI** and **Incentivized Learning**, it allows students to upload PDF notes to IPFS and earn **NTK (NoteTokens)** as rewards.



---

## 🚀 Key Features

- **Decentralized Storage:** Utilizes IPFS (via Pinata) for permanent, peer-to-peer document hosting.
- **Smart Contract Rewards:** Automated minting of ERC-20 tokens (NTK) to uploaders upon document download.
- **Web3 Integration:** Full MetaMask compatibility for secure identity and transaction management.
- **Modern UI/UX:** Responsive Glassmorphic dashboard featuring Framer Motion staggered animations.
- **Real-time Search:** Optimized client-side filtering for instant note discovery.

---

## 🛠️ Technical Stack

### **Frontend**
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Dark Mode optimized)
- **State Management:** React Context API (Web3 & Theme)
- **Animations:** Framer Motion

### **Blockchain & Backend**
- **Language:** Solidity (^0.8.20)
- **Library:** OpenZeppelin (ERC20 & Access Control)
- **Provider:** Ethers.js (v5)
- **Storage:** IPFS (InterPlanetary File System)



---

## 📂 Project Structure

```text
src/
├── components/        # UI Components (Navbar, AllNotes, UploadNote)
├── context/           # Web3 and Theme State Providers
├── contracts/         # ABI JSON files and Contract Addresses
├── App.jsx            # Main Application Logic
└── main.jsx           # Entry point

⚙️ Setup & Installation
1. Smart Contract Deployment
Deploy RewardToken.sol via Remix.

Deploy NotesStorage.sol using the RewardToken address as the constructor argument.

Important: Call setMinter(NOTES_STORAGE_ADDRESS, true) on the RewardToken contract.

2. Frontend Configuration
Clone the repository:

Bash
git clone [https://github.com/your-username/noteschain.git](https://github.com/your-username/noteschain.git)
cd noteschain
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file and add:

Code snippet
VITE_PINATA_JWT=your_jwt_here
Start the development server:

Bash
npm run dev
📜 License
Distributed under the MIT License. See LICENSE for more information.

🎓 Academic Credit
Developed for the Mumbai University Final Year Project curriculum.


---

### **Next Step for You**
Now that your code and documentation are ready, **would you like me to generate a "Project Summary" text?**