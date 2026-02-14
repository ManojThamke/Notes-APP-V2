import { createContext, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { TOKEN_ADDRESS } from "../contracts/contractConfig";
import tokenArtifact from "../contracts/RewardTokenABI.json";

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0");
  const [loading, setLoading] = useState(false);

  // 🛡️ Safety-Enhanced Balance Fetch
  const updateBalance = useCallback(async (currentAccount, currentSigner) => {
    try {
      // Check if addresses and signer are valid before calling
      if (!currentAccount || !TOKEN_ADDRESS || TOKEN_ADDRESS === "" || TOKEN_ADDRESS === "0x") return;

      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        tokenArtifact.abi,
        currentSigner
      );
      
      const tokenBalance = await tokenContract.balanceOf(currentAccount);
      setBalance(ethers.utils.formatEther(tokenBalance));
    } catch (err) {
      // This often fails if the contract isn't deployed on the active network
      console.warn("Balance fetch failed. Verify TOKEN_ADDRESS and Network.", err.message);
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("Please install MetaMask");
      
      setLoading(true);
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      
      // Request accounts
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      
      setAccount(accounts[0]);
      await updateBalance(accounts[0], signer);
      setLoading(false);
    } catch (error) {
      console.error("Connection error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkIfConnected = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const accounts = await provider.listAccounts();
          
          if (accounts.length > 0) {
            setAccount(accounts[0]);
            // Use signer for the balance check
            updateBalance(accounts[0], provider.getSigner());
          }
        } catch (error) {
          console.error("Initial connection check failed:", error);
        }
      }
    };

    checkIfConnected();

    if (window.ethereum) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          updateBalance(accounts[0], provider.getSigner());
        } else {
          setAccount(null);
          setBalance("0");
        }
      };

      const handleChainChanged = () => window.location.reload();

      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", handleChainChanged);

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [updateBalance]);

  return (
    <Web3Context.Provider value={{ account, balance, connectWallet, loading }}>
      {children}
    </Web3Context.Provider>
  );
};