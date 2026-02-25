# 📚 NotesChain: Decentralized Academic Repository

NotesChain is a high-performance Web3 platform designed to decentralize the sharing of academic resources. Built with a focus on **Glassmorphism UI** and **Incentivized Learning**, it allows students to upload PDF notes to IPFS and earn **NTK (NoteTokens)** as rewards. 

The ecosystem completely transforms a standard repository into an autonomous, gamified cryptocurrency economy!

---

## 🚀 Key Features

- **Decentralized Storage:** Utilizes IPFS (via Pinata) for permanent, peer-to-peer document hosting.
- **Smart Contract Rewards (NTK):** Automated minting of ERC-20 tokens (NTK) to uploaders when their documents are downloaded or upvoted.
- **Academic NFTs:** Every uploaded document automatically mints a unique ERC-721 Proof of Contribution NFT to the uploader's wallet.
- **DeFi Staking Vault:** Users can lock up their earned NTK tokens in a decentralized vault to earn passive yield (1% dynamic interest rate), featuring early withdrawal deflationary penalties.
- **Gamified "Daily Spin":** An interactive fortune wheel granting pseudo-random daily NTK airdrops.
- **Web3 Integration:** Full MetaMask compatibility for secure identity and transaction management on the Ethereum Sepolia Testnet.
- **Modern UI/UX:** Responsive Glassmorphic dashboard featuring Framer Motion staggered animations, real-time leaderboards, and interactive Web3 events.
- **Real-time Search:** Optimized client-side filtering for instant note discovery.

---

## 🛠️ Technical Stack

### **Frontend**
- **Framework:** React.js (Vite)
- **Styling:** Tailwind CSS (Dark Mode optimized)
- **State Management:** React Context API (Web3 & Theme)
- **Animations:** Framer Motion
- **Hosting:** Vercel

### **Blockchain & Backend**
- **Language:** Solidity (^0.8.20)
- **Framework:** Hardhat
- **Library:** OpenZeppelin (ERC20, ERC721, & Access Control)
- **Provider:** Ethers.js
- **Network:** Ethereum Sepolia Testnet (via Alchemy)
- **Storage:** IPFS (InterPlanetary File System via Pinata)

---

## 📂 Project Structure

```text
Notes-APP-V2/
├── contracts/         # Solidity Smart Contracts (NotesStorage, RewardToken)
├── scripts/           # Hardhat deployment & configuration scripts
├── frontend/          # React Vite Application containing:
│   ├── src/
│   │   ├── components/  # App UI (Navbar, AllNotes, UploadNote, SpinWheel, TopScholars, StakingDashboard)
│   │   ├── context/     # Web3 and Theme State Providers
│   │   ├── contracts/   # Auto-exported ABI JSON files & Contract config (contractConfig.js)
│   │   ├── App.jsx      # Main Application Layout
│   │   └── main.jsx     # App entry point
```

---

## ⚙️ Setup & Installation

### 1. Smart Contract Deployment (Local or Testnet)

Clone the repository and install Hardhat dependencies:
```bash
git clone https://github.com/ManojThamke/Notes-APP-V2.git
cd Notes-APP-V2
npm install
```

To deploy the contracts to the active network (e.g., local Hardhat node or Sepolia), run the automated deployment script. This script automatically handles compiling, deploying the `RewardToken` and `NotesStorage` contracts, setting the cross-contract minter permissions, and exporting the new ABIs directly into the React frontend!

```bash
# To run locally:
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost

# To deploy to Sepolia:
npx hardhat run scripts/deploy.js --network sepolia
```

### 2. Frontend Configuration

Navigate to the frontend folder and install its dependencies:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder to handle your IPFS pinning:
```env
VITE_PINATA_JWT="your_pinata_jwt_here"
```

Start the development server:
```bash
npm run dev
```

---

## 📜 License
Distributed under the MIT License. See `LICENSE` for more information.

## 🎓 Academic Credit
Developed for the Mumbai University Final Year Project curriculum.