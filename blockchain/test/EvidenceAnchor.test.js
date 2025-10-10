const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EvidenceAnchor", function () {
  let contract;
  let owner;
  
  beforeEach(async function () {
    [owner] = await ethers.getSigners();
    const EvidenceAnchor = await ethers.getContractFactory("EvidenceAnchor");
    contract = await EvidenceAnchor.deploy();
    await contract.waitForDeployment();
  });
  
  it("Should anchor evidence", async function () {
    const evidenceId = ethers.id("test1");
    const merkleRoot = ethers.id("root");
    const cidRoot = ethers.id("cid");
    const s3Key = ethers.id("s3");
    const policyId = ethers.id("policy");
    
    await contract.anchorEvidence(evidenceId, merkleRoot, cidRoot, s3Key, policyId);
    
    const anchor = await contract.anchors(evidenceId);
    expect(anchor.exists).to.be.true;
    expect(anchor.merkleRoot).to.equal(merkleRoot);
  });
  
  it("Should verify evidence", async function () {
    const evidenceId = ethers.id("test1");
    const merkleRoot = ethers.id("root");
    const cidRoot = ethers.id("cid");
    const s3Key = ethers.id("s3");
    const policyId = ethers.id("policy");
    
    await contract.anchorEvidence(evidenceId, merkleRoot, cidRoot, s3Key, policyId);
    
    await contract.verifyEvidence(evidenceId);
    
    const anchor = await contract.anchors(evidenceId);
    expect(anchor.submitter).to.equal(owner.address);
    expect(anchor.exists).to.be.true;
  });
  
  it("Should reject duplicate anchors", async function () {
    const evidenceId = ethers.id("test1");
    const merkleRoot = ethers.id("root");
    const cidRoot = ethers.id("cid");
    const s3Key = ethers.id("s3");
    const policyId = ethers.id("policy");
    
    await contract.anchorEvidence(evidenceId, merkleRoot, cidRoot, s3Key, policyId);
    
    await expect(
      contract.anchorEvidence(evidenceId, merkleRoot, cidRoot, s3Key, policyId)
    ).to.be.revertedWith("Already anchored");
  });
});
