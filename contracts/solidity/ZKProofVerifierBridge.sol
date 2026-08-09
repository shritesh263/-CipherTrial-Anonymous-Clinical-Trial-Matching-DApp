// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ZKProofVerifierBridge
 * @dev Cross-chain verifier interface for Midnight Halo2 / Compact ZK Proofs.
 */
contract ZKProofVerifierBridge {
    struct ZKProofPayload {
        uint256 trialId;
        bytes32 proofHash;
        bytes32 nullifierHash;
        bool circuitValidity;
        uint256 timestamp;
    }

    mapping(bytes32 => bool) public verifiedProofs;

    event ProofVerifiedOnBridge(uint256 indexed trialId, bytes32 indexed proofHash, bytes32 indexed nullifierHash);

    function verifyOffChainZKProof(
        uint256 _trialId,
        bytes32 _proofHash,
        bytes32 _nullifierHash,
        bool _circuitValidity
    ) external returns (bool) {
        require(_circuitValidity, "INVALID_CIRCUIT_VALIDITY");
        require(!verifiedProofs[_proofHash], "PROOF_ALREADY_VERIFIED");

        verifiedProofs[_proofHash] = true;

        emit ProofVerifiedOnBridge(_trialId, _proofHash, _nullifierHash);
        return true;
    }
}
