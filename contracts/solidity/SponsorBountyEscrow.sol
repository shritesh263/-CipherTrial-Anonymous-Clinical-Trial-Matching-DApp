// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SponsorBountyEscrow
 * @dev Solidity smart contract for locking sponsor participant bounty funds
 * and releasing rewards upon valid ZK proof verification.
 */
contract SponsorBountyEscrow {
    address public owner;

    // Mapping trialId => total bounty locked in wei
    mapping(uint256 => uint256) public escrowBalances;

    // Mapping trialId => payout per verified match
    mapping(uint256 => uint256) public payoutPerMatch;

    // Mapping nullifierHash => bounty claimed status
    mapping(bytes32 => bool) public claimedBounties;

    event EscrowDeposited(uint256 indexed trialId, uint256 amount, uint256 perMatchPayout);
    event BountyClaimed(uint256 indexed trialId, bytes32 indexed nullifierHash, address indexed recipient, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Deposit ETH / ERC20 token bounty for a clinical trial.
     */
    function depositEscrow(uint256 _trialId, uint256 _perMatchPayout) external payable {
        require(msg.value > 0, "MUST_DEPOSIT_VALUE");

        escrowBalances[_trialId] += msg.value;
        payoutPerMatch[_trialId] = _perMatchPayout;

        emit EscrowDeposited(_trialId, msg.value, _perMatchPayout);
    }

    /**
     * @notice Claim participant bounty using single-use ZK nullifier.
     */
    function claimBounty(
        uint256 _trialId,
        bytes32 _nullifierHash,
        address payable _recipient
    ) external returns (bool) {
        require(!claimedBounties[_nullifierHash], "BOUNTY_ALREADY_CLAIMED");
        uint256 payout = payoutPerMatch[_trialId];
        require(payout > 0, "NO_PAYOUT_CONFIGURED");
        require(escrowBalances[_trialId] >= payout, "INSUFFICIENT_ESCROW_BALANCE");

        escrowBalances[_trialId] -= payout;
        claimedBounties[_nullifierHash] = true;

        (bool success, ) = _recipient.call{value: payout}("");
        require(success, "ETH_TRANSFER_FAILED");

        emit BountyClaimed(_trialId, _nullifierHash, _recipient, payout);
        return true;
    }
}
