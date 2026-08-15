// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ProofAnchor {
    struct Anchor {
        bytes32 documentHash;
        uint256 timestamp;
        address anchoredBy;
    }

    mapping(string => Anchor) private anchors;

    event CredentialAnchored(
        string indexed credentialId,
        bytes32 indexed documentHash,
        uint256 timestamp,
        address indexed anchoredBy
    );

    function anchorCredential(
        string calldata credentialId,
        bytes32 documentHash
    ) external {
        require(bytes(credentialId).length > 0, "Credential ID required");
        require(documentHash != bytes32(0), "Hash required");
        require(
            anchors[credentialId].timestamp == 0,
            "Credential already anchored"
        );

        anchors[credentialId] = Anchor({
            documentHash: documentHash,
            timestamp: block.timestamp,
            anchoredBy: msg.sender
        });

        emit CredentialAnchored(
            credentialId,
            documentHash,
            block.timestamp,
            msg.sender
        );
    }

    function getAnchor(
        string calldata credentialId
    )
        external
        view
        returns (
            bytes32 documentHash,
            uint256 timestamp,
            address anchoredBy
        )
    {
        Anchor memory anchor = anchors[credentialId];

        require(anchor.timestamp != 0, "Credential not anchored");

        return (
            anchor.documentHash,
            anchor.timestamp,
            anchor.anchoredBy
        );
    }
}