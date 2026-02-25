// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/**
 * @dev Interface for the Reward Token contract.
 */
interface IRewardToken {
    function mint(address to, uint256 amount) external;
    function burnFromUser(address from, uint256 amount) external;
}

/**
 * @title NotesStorage (Academic Enhanced Version)
 * @dev Manages academic note uploads, automates uploader rewards, mints NFTs, and handles upvotes.
 */
contract NotesStorage is ERC721URIStorage {

    struct Note {
        string title;
        string category; 
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        uint256 downloads;
        uint256 upvotes;
    }

    // Use private state and a public getter to save on gas for large arrays
    Note[] private notes;
    IRewardToken public immutable rewardToken;

    // Signup bonus feature
    mapping(address => bool) public hasReceivedBonus;
    uint256 public constant SIGNUP_BONUS = 15 * 10 ** 18; // Equivalent to 3 interactions

    // Daily Spin Event
    mapping(address => uint256) public lastSpinTime;

    // Gamified Staking 
    struct StakeInfo {
        uint256 amount;
        uint256 since;
    }
    mapping(address => StakeInfo) public userStakes;

    // Events for professional off-chain indexing
    event NoteUploaded(
        uint256 indexed noteId, 
        string title, 
        string category, 
        address indexed uploader
    );
    event NoteDownloaded(
        uint256 indexed noteId, 
        address indexed uploader, 
        address indexed downloader, 
        uint256 newDownloadCount
    );
    event NoteUpvoted(
        uint256 indexed noteId,
        address indexed upvoter,
        address indexed uploader,
        uint256 newUpvoteCount
    );
    event SpunWheel(
        address indexed user,
        uint256 rewardAmount,
        uint256 timestamp
    );
    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount, uint256 reward);

    constructor(address _tokenAddress) ERC721("NotesNFT", "NNFT") {
        require(_tokenAddress != address(0), "Invalid token address");
        rewardToken = IRewardToken(_tokenAddress);
    }

    /**
     * @dev Internal function to give new users a starting income
     */
    function _distributeBonus(address user) internal {
        if (!hasReceivedBonus[user]) {
            hasReceivedBonus[user] = true;
            rewardToken.mint(user, SIGNUP_BONUS);
        }
    }

    /**
     * @notice Registers a note on the blockchain.
     * @param _title The document name.
     * @param _category The academic subject (e.g., "Computer Science").
     * @param _ipfsHash The Pinata IPFS content identifier.
     */
    function uploadNote(
        string calldata _title, 
        string calldata _category, 
        string calldata _ipfsHash
    ) external {
        _distributeBonus(msg.sender);

        // String length validation
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        uint256 newItemId = notes.length;
        
        notes.push(Note({
            title: _title,
            category: _category,
            ipfsHash: _ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            downloads: 0,
            upvotes: 0
        }));

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, _ipfsHash);

        emit NoteUploaded(newItemId, _title, _category, msg.sender);
    }

    /**
     * @notice Records a download and triggers uploader reward.
     * @param index The blockchain index of the note.
     */
    function downloadNote(uint256 index) external {
        _distributeBonus(msg.sender);

        // Range validation to prevent array out-of-bounds errors
        require(index < notes.length, "Invalid note index");

        Note storage note = notes[index];
        note.downloads += 1;

        // Reward the uploader 5 NTK tokens (assuming 18 decimal precision)
        rewardToken.mint(note.uploader, 5 * 10 ** 18);

        emit NoteDownloaded(index, note.uploader, msg.sender, note.downloads);
    }

    /**
     * @notice Allows a user to upvote a note using 1 NTK token.
     * @param index The blockchain index of the note.
     */
    function upvoteNote(uint256 index) external {
        _distributeBonus(msg.sender);

        require(index < notes.length, "Invalid note index");
        Note storage note = notes[index];
        require(msg.sender != note.uploader, "Cannot upvote own note");

        // Burn 1 token from upvoter (tips the ecosystem/uploader)
        rewardToken.burnFromUser(msg.sender, 1 * 10 ** 18);
        
        // Mint 1 token directly to the uploader as a tip
        rewardToken.mint(note.uploader, 1 * 10 ** 18);

        note.upvotes += 1;

        emit NoteUpvoted(index, msg.sender, note.uploader, note.upvotes);
    }

    /**
     * @notice Allows a user to spin a lucky wheel once every 24 hours to earn NTK.
     * @dev Uses block.prevrandao for basic pseudo-randomness.
     */
    function spinWheel() external {
        _distributeBonus(msg.sender);

        require(block.timestamp >= lastSpinTime[msg.sender] + 1 days, "Can only spin once every 24 hours");
        lastSpinTime[msg.sender] = block.timestamp;

        // Note: For local development and low-stakes gamification this is okay,
        // but never use block.timestamp/prevrandao for high-value on-chain randomness.
        uint256 randomWord = uint256(keccak256(abi.encodePacked(block.timestamp, block.prevrandao, msg.sender)));
        uint16 chance = uint16(randomWord % 100);

        uint256 reward;
        if (chance < 50) {
            reward = 1 * 10 ** 18;  // 50% chance: 1 NTK
        } else if (chance < 80) {
            reward = 5 * 10 ** 18;  // 30% chance: 5 NTK
        } else if (chance < 95) {
            reward = 10 * 10 ** 18; // 15% chance: 10 NTK
        } else {
            reward = 50 * 10 ** 18; // 5% chance: 50 NTK (Jackpot!)
        }

        rewardToken.mint(msg.sender, reward);

        emit SpunWheel(msg.sender, reward, block.timestamp);
    }

    /**
     * @notice Stakes NTK to earn yield 
     */
    function stakeNTK(uint256 amount) external {
        require(amount > 0, "Cannot stake 0");
        
        if (userStakes[msg.sender].amount > 0) {
            _unstakeAndReward(msg.sender);
        }

        // We burn tokens instead of transfer to avoid needing infinite approvals beforehand.
        rewardToken.burnFromUser(msg.sender, amount);
        
        userStakes[msg.sender] = StakeInfo({
            amount: amount,
            since: block.timestamp
        });
        
        emit Staked(msg.sender, amount);
    }

    function _unstakeAndReward(address user) internal {
        StakeInfo storage s = userStakes[user];
        if (s.amount == 0) return;

        uint256 timeStaked = block.timestamp - s.since;
        uint256 stakedAmount = s.amount;
        
        // Reset stake
        s.amount = 0;
        s.since = 0;

        // Penalty Logic: Must stake for at least 10 minutes (600 seconds)
        if (timeStaked < 600) {
            // Early unstake penalty: 20% of principal is burned!
            uint256 penalty = (stakedAmount * 20) / 100;
            uint256 returnAmount = stakedAmount - penalty;
            
            // Mint back only 80% (since we burned 100% on deposit)
            rewardToken.mint(user, returnAmount);
            emit Unstaked(user, returnAmount, 0);
        } else {
            // Gamified high-yield: 1% return per minute for instantaneous test demo
            uint256 minutesStaked = timeStaked / 60;
            uint256 reward = (stakedAmount * minutesStaked) / 100;
            
            rewardToken.mint(user, stakedAmount + reward);
            emit Unstaked(user, stakedAmount, reward);
        }
    }

    /**
     * @notice Unstakes NTK and retrieves all yield instantly. 
     */
    function unstakeNTK() external {
        _unstakeAndReward(msg.sender);
    }
    
    /**
     * @notice Live calculations for frontend viewing. 
     */
    function getPendingRewards(address user) external view returns (uint256) {
        StakeInfo storage s = userStakes[user];
        if (s.amount == 0) return 0;
        
        uint256 timeStaked = block.timestamp - s.since;
        if (timeStaked < 600) {
            return 0; // No rewards if under 10 minutes lockup
        }

        uint256 minutesStaked = timeStaked / 60;
        return (s.amount * minutesStaked) / 100;
    }

    /**
     * @notice Returns the total note repository.
     */
    function getAllNotes() external view returns (Note[] memory) {
        return notes;
    }

    /**
     * @notice Returns total number of notes stored.
     */
    function getNotesCount() external view returns (uint256) {
        return notes.length;
    }
}