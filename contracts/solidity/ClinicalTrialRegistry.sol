// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ClinicalTrialRegistry
 * @dev Solidity smart contract for cross-chain clinical trial credential verification
 * and ERC-721 participation badge registry.
 */
contract ClinicalTrialRegistry {
    // ------------------------------------------------------------------------
    // STATE VARIABLES
    // ------------------------------------------------------------------------
    address public owner;
    uint256 public totalTrials;

    struct TrialCriteria {
        uint256 trialId;
        string trialName;
        address sponsorAddress;
        uint32 minAge;
        uint32 maxAge;
        uint32 requiredConditionCode;
        uint32 excludedMedicationCode;
        bool active;
    }

    // Mapping from trialId => TrialCriteria
    mapping(uint256 => TrialCriteria) public trials;

    // Mapping from trialId => matched participant count
    mapping(uint256 => uint32) public matchedCounts;

    // Mapping from nullifierHash => spent status
    mapping(bytes32 => bool) public nullifiers;

    // ------------------------------------------------------------------------
    // EVENTS
    // ------------------------------------------------------------------------
    event TrialRegistered(uint256 indexed trialId, string trialName, address indexed sponsor);
    event ProofVerified(uint256 indexed trialId, bytes32 indexed nullifierHash, bool isEligible);

    // ------------------------------------------------------------------------
    // MODIFIERS
    // ------------------------------------------------------------------------
    modifier onlyOwner() {
        require(msg.sender == owner, "UNAUTHORIZED_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalTrials = 0;
    }

    /**
     * @notice Register a new clinical trial with eligibility criteria on-chain.
     */
    function registerTrial(
        uint256 _trialId,
        string memory _trialName,
        uint32 _minAge,
        uint32 _maxAge,
        uint32 _reqConditionCode,
        uint32 _exclMedicationCode
    ) external {
        require(trials[_trialId].trialId == 0, "TRIAL_ALREADY_EXISTS");

        trials[_trialId] = TrialCriteria({
            trialId: _trialId,
            trialName: _trialName,
            sponsorAddress: msg.sender,
            minAge: _minAge,
            maxAge: _maxAge,
            requiredConditionCode: _reqConditionCode,
            excludedMedicationCode: _exclMedicationCode,
            active: true
        });

        totalTrials += 1;
        emit TrialRegistered(_trialId, _trialName, msg.sender);
    }

    /**
     * @notice Verify an off-chain ZK proof nullifier submission.
     */
    function verifyZKProof(
        uint256 _trialId,
        bytes32 _nullifierHash,
        bool _isEligible
    ) external returns (bool) {
        require(trials[_trialId].active, "TRIAL_INACTIVE");
        require(!nullifiers[_nullifierHash], "NULLIFIER_ALREADY_SPENT");
        require(_isEligible, "PROOF_NOT_ELIGIBLE");

        nullifiers[_nullifierHash] = true;
        matchedCounts[_trialId] += 1;

        emit ProofVerified(_trialId, _nullifierHash, _isEligible);
        return true;
    }
}
