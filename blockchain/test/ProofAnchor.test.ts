import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, stringToBytes } from "viem";

describe("ProofAnchor Smart Contract", async function () {
  const { viem } = await network.create();
  const publicClient = await viem.getPublicClient();
  const walletClients = await viem.getWalletClients();
  const [deployer, secondUser] = walletClients;

  const validCredentialId = "PC-2026-CS-0001";
  const sampleHash = "0x9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08" as `0x${string}`;
  const zeroHash = "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`;

  it("1. Should deploy ProofAnchor contract successfully", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");
    assert.ok(proofAnchor.address, "Contract should have a valid deployed address");
  });

  it("2. Should anchor a new credential and retrieve its data correctly", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    await proofAnchor.write.anchorCredential([validCredentialId, sampleHash]);

    const [retrievedHash, timestamp, anchoredBy] = await proofAnchor.read.getAnchor([validCredentialId]);

    assert.equal(retrievedHash.toLowerCase(), sampleHash.toLowerCase(), "Retrieved hash must match anchored hash");
    assert.ok(timestamp > 0n, "Timestamp must be a positive unix timestamp");
    assert.equal(
      anchoredBy.toLowerCase(),
      deployer.account.address.toLowerCase(),
      "AnchoredBy must match sender address"
    );
  });

  it("3. Should reject anchoring with an empty credential ID", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    await assert.rejects(
      async () => {
        await proofAnchor.write.anchorCredential(["", sampleHash]);
      },
      /Credential ID required/,
      "Must revert when credentialId is empty"
    );
  });

  it("4. Should reject anchoring with a zero document hash", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    await assert.rejects(
      async () => {
        await proofAnchor.write.anchorCredential([validCredentialId, zeroHash]);
      },
      /Hash required/,
      "Must revert when documentHash is zero"
    );
  });

  it("5. Should reject duplicate anchoring for the same credential ID", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    // First anchor succeeds
    await proofAnchor.write.anchorCredential([validCredentialId, sampleHash]);

    // Second anchor with identical ID must fail
    const anotherHash = "0x5a105e8b9d40e1329780d62ea2265d8a1e5d571a3d1e77aaa71e24a006d329ee" as `0x${string}`;
    await assert.rejects(
      async () => {
        await proofAnchor.write.anchorCredential([validCredentialId, anotherHash]);
      },
      /Credential already anchored/,
      "Must revert on duplicate credential ID"
    );
  });

  it("6. Should revert when querying an unanchored credential ID", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    await assert.rejects(
      async () => {
        await proofAnchor.read.getAnchor(["NON-EXISTENT-ID"]);
      },
      /Credential not anchored/,
      "Must revert when credential is not anchored"
    );
  });

  it("7. Should emit CredentialAnchored event with correct parameters", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    const deploymentBlockNumber = await publicClient.getBlockNumber();

    await proofAnchor.write.anchorCredential([validCredentialId, sampleHash]);

    const events = await publicClient.getContractEvents({
      address: proofAnchor.address,
      abi: proofAnchor.abi,
      eventName: "CredentialAnchored",
      fromBlock: deploymentBlockNumber,
      strict: true,
    });

    assert.equal(events.length, 1, "Exactly one CredentialAnchored event should be emitted");
    
    // Indexed string parameters in Solidity events are stored as keccak256 hash
    const expectedHashedId = keccak256(stringToBytes(validCredentialId));
    assert.equal(events[0].args.credentialId?.toLowerCase(), expectedHashedId.toLowerCase());
    assert.equal(events[0].args.documentHash?.toLowerCase(), sampleHash.toLowerCase());
    assert.equal(
      events[0].args.anchoredBy?.toLowerCase(),
      deployer.account.address.toLowerCase()
    );
    assert.ok((events[0].args.timestamp ?? 0n) > 0n, "Event timestamp should be positive");
  });

  it("8. Should store and isolate multiple distinct credentials anchored by different accounts", async function () {
    const proofAnchor = await viem.deployContract("ProofAnchor");

    const credId1 = "PC-2026-USER1";
    const hash1 = "0x1111111111111111111111111111111111111111111111111111111111111111" as `0x${string}`;

    const credId2 = "PC-2026-USER2";
    const hash2 = "0x2222222222222222222222222222222222222222222222222222222222222222" as `0x${string}`;

    // Deployer anchors cred 1
    await proofAnchor.write.anchorCredential([credId1, hash1]);

    // Second user anchors cred 2
    const proofAnchorSecondUser = await viem.getContractAt("ProofAnchor", proofAnchor.address, {
      client: { wallet: secondUser },
    });
    await proofAnchorSecondUser.write.anchorCredential([credId2, hash2]);

    // Verify Credential 1
    const [retrievedHash1, , anchoredBy1] = await proofAnchor.read.getAnchor([credId1]);
    assert.equal(retrievedHash1.toLowerCase(), hash1.toLowerCase());
    assert.equal(anchoredBy1.toLowerCase(), deployer.account.address.toLowerCase());

    // Verify Credential 2
    const [retrievedHash2, , anchoredBy2] = await proofAnchor.read.getAnchor([credId2]);
    assert.equal(retrievedHash2.toLowerCase(), hash2.toLowerCase());
    assert.equal(anchoredBy2.toLowerCase(), secondUser.account.address.toLowerCase());
  });
});
