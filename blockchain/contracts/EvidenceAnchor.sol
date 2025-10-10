// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract EvidenceAnchor {
    struct Anchor {
        bytes32 merkleRoot;
        bytes32 cidRoot;
        bytes32 s3Key;
        uint64 timestamp;
        bytes32 policyId;
        address submitter;
        bool exists;
    }
    
    mapping(bytes32 => Anchor) public anchors;
    mapping(address => bytes32[]) public userAnchors;
    uint256 public totalAnchors;
    
    event EvidenceAnchored(
        bytes32 indexed evidenceId,
        bytes32 merkleRoot,
        bytes32 cidRoot,
        uint64 timestamp,
        address indexed submitter
    );
    
    event EvidenceVerified(
        bytes32 indexed evidenceId,
        address indexed verifier
    );
    
    function anchorEvidence(
        bytes32 evidenceId,
        bytes32 merkleRoot,
        bytes32 cidRoot,
        bytes32 s3Key,
        bytes32 policyId
    ) external {
        require(!anchors[evidenceId].exists, "Already anchored");
        require(merkleRoot != bytes32(0), "Invalid merkle root");
        
        anchors[evidenceId] = Anchor({
            merkleRoot: merkleRoot,
            cidRoot: cidRoot,
            s3Key: s3Key,
            timestamp: uint64(block.timestamp),
            policyId: policyId,
            submitter: msg.sender,
            exists: true
        });
        
        userAnchors[msg.sender].push(evidenceId);
        totalAnchors++;
        
        emit EvidenceAnchored(
            evidenceId,
            merkleRoot,
            cidRoot,
            uint64(block.timestamp),
            msg.sender
        );
    }
    
    function verifyEvidence(bytes32 evidenceId) 
        external 
        returns (Anchor memory) 
    {
        require(anchors[evidenceId].exists, "Not found");
        
        emit EvidenceVerified(evidenceId, msg.sender);
        
        return anchors[evidenceId];
    }
    
    function getUserAnchors(address user) 
        external 
        view 
        returns (bytes32[] memory) 
    {
        return userAnchors[user];
    }
}
