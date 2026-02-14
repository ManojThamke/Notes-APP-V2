// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken (NTK)
 * @dev ERC20 token that rewards users for sharing academic content.
 */
contract RewardToken is ERC20, Ownable {

    // Mapping to keep track of authorized minters (e.g., the NotesStorage contract)
    mapping(address => bool) public isMinter;

    event MinterStatusChanged(address indexed minter, bool status);

    constructor(address initialOwner) 
        ERC20("NoteToken", "NTK") 
        Ownable(initialOwner)
    {
        // Initial supply for liquidity/testing
        _mint(initialOwner, 100000 * 10 ** decimals());
        
        // Owner is a minter by default
        isMinter[initialOwner] = true;
    }

    /**
     * @notice Allows the owner to authorize the NotesStorage contract to mint tokens
     */
    function setMinter(address _minter, bool _status) external onlyOwner {
        isMinter[_minter] = _status;
        emit MinterStatusChanged(_minter, _status);
    }

    /**
     * @notice Mint function used by the NotesStorage contract
     * @dev Restricted to authorized minters only
     */
    function mint(address to, uint256 amount) external {
        require(isMinter[msg.sender], "Not authorized to mint");
        _mint(to, amount);
    }
}