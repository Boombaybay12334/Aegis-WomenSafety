const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying EvidenceAnchor...\n");
  
  const EvidenceAnchor = await hre.ethers.getContractFactory("EvidenceAnchor");
  const contract = await EvidenceAnchor.deploy();
  
  await contract.waitForDeployment();
  
  const address = await contract.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  
  console.log(`✅ Deployed to: ${address}`);
  console.log(`Network: ${hre.network.name}`);
  console.log(`Chain ID: ${network.chainId.toString()}`);
  
  const deployment = {
    address,
    network: hre.network.name,
    chainId: network.chainId.toString(),
    timestamp: new Date().toISOString()
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deployment, null, 2)
  );
  
  console.log("\n✅ Saved to deployment.json\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
