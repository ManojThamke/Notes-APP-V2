// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @dev Interface for the Reward Token contract.
 */
interface IRewardToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title NotesStorage (Academic Enhanced Version)
 * @dev Manages academic note uploads and automates uploader rewards.
 */
contract NotesStorage {

    struct Note {
        string title;
        string category; 
        string ipfsHash;
        address uploader;
        uint256 timestamp;
        uint256 downloads;
    }

    // Use private state and a public getter to save on gas for large arrays
    Note[] private notes;
    IRewardToken public immutable rewardToken;

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

    constructor(address _tokenAddress) {
        require(_tokenAddress != address(0), "Invalid token address");
        rewardToken = IRewardToken(_tokenAddress);
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
        // String length validation
        require(bytes(_title).length > 0, "Title cannot be empty");
        require(bytes(_category).length > 0, "Category cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash required");

        notes.push(Note({
            title: _title,
            category: _category,
            ipfsHash: _ipfsHash,
            uploader: msg.sender,
            timestamp: block.timestamp,
            downloads: 0
        }));

        emit NoteUploaded(notes.length - 1, _title, _category, msg.sender);
    }

    /**
     * @notice Records a download and triggers uploader reward.
     * @param index The blockchain index of the note.
     */
    function downloadNote(uint256 index) external {
        // Range validation to prevent array out-of-bounds errors
        require(index < notes.length, "Invalid note index");

        Note storage note = notes[index];
        note.downloads += 1;

        // Reward the uploader 5 NTK tokens (assuming 18 decimal precision)
        rewardToken.mint(note.uploader, 5 * 10 ** 18);

        emit NoteDownloaded(index, note.uploader, msg.sender, note.downloads);
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