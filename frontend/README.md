# Project Overview: NotesChain (Decentralized Academic Social Network)

## 1. Project Summary
NotesChain is a fully decentralized Web3 application designed to revolutionize academic note-sharing. It replaces traditional centralized databases with a gamified, autonomous blockchain economy. Users upload studying materials to the decentralized web (IPFS) and interact with the platform using a custom cryptocurrency token called **NoteToken (NTK)**. The platform heavily incentivizes high-quality contributions by automatically paying uploaders in crypto whenever their notes are downloaded or upvoted.

## 2. Technology Stack
*   **Frontend**: React.js, Vite, Tailwind CSS (for styling), and Framer Motion (for dynamic UI micro-animations).
*   **Blockchain / Smart Contracts**: Written in Solidity and managed via the Hardhat development framework.
*   **Web3 Integration**: Ethers.js library acting as the bridge between the frontend UI and the blockchain.
*   **Decentralized Storage**: Pinata (IPFS gateway) used to permanently pin the actual PDF/Image files across a network of global nodes.
*   **Hosting**: The smart contracts are deployed permanently to the **Ethereum Sepolia Testnet**, and the frontend is hosted globally via **Vercel**.
*   **Wallet Authentication**: Complete integration with MetaMask for user login and digital signature verification.

## 3. Core Decentralized Features
*   **Immutable Note Storage**: Notes are hashed and stored via IPFS. The blockchain only saves the `ipfsHash` (CID), the Uploader's wallet address, and the timestamp—making the database virtually unhackable and permanent.
*   **NFT Minting (Proof of Contribution)**: Upon successfully uploading a note, the `NotesStorage.sol` contract immediately mints a unique ERC-721 Non-Fungible Token (NFT) to the uploader's wallet, mathematically proving their ownership and contribution to the academic ecosystem.
*   **Native Economy (NTK Token)**: The entire ecosystem is powered by a custom ERC-20 token (NoteToken / NTK). 
    *   **Signup Bonus**: New wallets are immediately airdropped 15 NTK.
    *   **Earn by Uploading**: Every time a user's note is downloaded by a peer, the smart contract automatically mints and sends the uploader 5 NTK.
    *   **Tipping / Upvoting**: Users can spend 1 NTK to "Upvote" a high-quality note. The platform burns the upvoter's token and instantly sends 1 NTK directly to the original uploader as a tip.

## 4. Gamification & DeFi Integration
*   **Daily Spin Wheel**: A visually stunning, interactive widget allowing users to spin a fortune wheel exactly once every 24 hours. The smart contract utilizes pseudo-randomness (`block.prevrandao`) to reward the user with varying amounts of NTK (1, 5, 10, or a massive 50 NTK jackpot).
*   **DeFi Staking Vault (Yield Farming)**: Users can temporarily lock up (burn) their NTK tokens into a decentralized vault to earn passive yield.
    *   **High-Yield Profit**: The vault dynamically calculates interest, rewarding the user with a 1% profit *per minute* while their tokens are staked.
    *   **Ruthless Deflationary Penalties**: To prevent pure hyper-inflation, the vault enforces a strict **10-minute lockup**. If a user grows impatient and unstakes early, the smart contract penalizes them by burning 20% of their principal deposit and rewarding them 0 profit.
*   **Top Scholars Leaderboard**: A dynamic tracking system that evaluates on-chain data to rank the most active users on the platform based on a weighted formula (Total Upvotes, Downloads Generated, and Files Uploaded).

## 5. Security & Infrastructure Highlights
*   **Authorized Minting Logic**: The `RewardToken.sol` contract is protected so that only authorized addresses (specifically the `NotesStorage` contract and the platform Owner) are allowed to mint new NTK tokens, preventing massive exploits.
*   **Gasless Interactions**: Users do not have to pre-approve massive token spending. Features like upvoting handle token burning via administrative `burnFromUser` logic directly within the ecosystem to ensure smooth UX.

---

## Local Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Setup Environment Variables**:
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_PINATA_JWT="your_pinata_jwt_here"
   ```
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
