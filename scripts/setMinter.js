const hre = require("hardhat");

async function main() {
    const tokenAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    const notesAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

    const RewardToken = await hre.ethers.getContractFactory("RewardToken");
    // Attach to the currently deployed token
    const rewardToken = await RewardToken.attach(tokenAddress);

    console.log("Setting NotesStorage as an authorized minter...");
    const tx = await rewardToken.setMinter(notesAddress, true);
    await tx.wait();

    console.log("NotesStorage is now allowed to mint NTK!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
