const hre = require("hardhat");

async function main() {
  console.log("🔗 Interacting with EvidenceAnchor\n");
  
  // Load deployed contract
  const deployment = require("../deployment.json");
  console.log(`Contract Address: ${deployment.address}\n`);
  
  const EvidenceAnchor = await hre.ethers.getContractFactory("EvidenceAnchor");
  const contract = EvidenceAnchor.attach(deployment.address);
  
  // Create UNIQUE evidence data using timestamp
  const uniqueId = `evidence-${Date.now()}`;
  const evidenceId = hre.ethers.id(uniqueId);
  const merkleRoot = hre.ethers.id(`merkle-root-${Date.now()}`);
  const cidRoot = hre.ethers.id(`QmCID${Date.now()}`);
  const s3Key = hre.ethers.id(`s3://aegis/evidence-${Date.now()}`);
  const policyId = hre.ethers.id("privacy-policy-v1.0");
  
  console.log(`📝 Anchoring Evidence: ${uniqueId}...`);
  
  const tx = await contract.anchorEvidence(
    evidenceId,
    merkleRoot,
    cidRoot,
    s3Key,
    policyId
  );
  
  console.log(`Transaction Hash: ${tx.hash}`);
  console.log("⏳ Waiting for confirmation...");
  
  const receipt = await tx.wait();
  console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
  console.log(`⛽ Gas Used: ${receipt.gasUsed.toString()}\n`);
  
  // Read the anchor back
  console.log("🔍 Reading Evidence from Blockchain...");
  const anchor = await contract.anchors(evidenceId);
  
  console.log("\n✅ Evidence Retrieved Successfully!");
  console.log("═════════════════════════════════════");
  console.log(`Evidence ID: ${uniqueId}`);
  console.log(`Merkle Root: ${anchor.merkleRoot}`);
  console.log(`CID Root: ${anchor.cidRoot}`);
  console.log(`S3 Key: ${anchor.s3Key}`);
  console.log(`Timestamp: ${new Date(Number(anchor.timestamp) * 1000).toISOString()}`);
  console.log(`Submitter: ${anchor.submitter}`);
  console.log(`Exists: ${anchor.exists}`);
  console.log("═════════════════════════════════════");
  
  const total = await contract.totalAnchors();
  console.log(`\n📊 Total Anchors on Chain: ${total}`);
  
  console.log("\n🎉 NEW EVIDENCE ANCHORED SUCCESSFULLY!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
