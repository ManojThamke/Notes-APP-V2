const hre = require("hardhat");

async function main() {

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // Deploy RewardToken
  const RewardToken = await hre.ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy(deployer.address);
  await rewardToken.deployed();

  console.log("RewardToken deployed at:", rewardToken.address);

  // Deploy NotesStorage
  const NotesStorage = await hre.ethers.getContractFactory("NotesStorage");
  const notesStorage = await NotesStorage.deploy(rewardToken.address);
  await notesStorage.deployed();

  console.log("NotesStorage deployed at:", notesStorage.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
