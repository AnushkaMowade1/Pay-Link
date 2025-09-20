const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying PayLink Rewards System to Shardeum Unstablenet...")

  const [deployer] = await ethers.getSigners()
  console.log("Deploying contracts with account:", deployer.address)
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString())

  // Deploy RewardCoin
  console.log("\n1. Deploying RewardCoin...")
  const RewardCoin = await ethers.getContractFactory("RewardCoin")
  const rewardCoin = await RewardCoin.deploy("PayLink Reward Token", "RWD", deployer.address)
  await rewardCoin.waitForDeployment()
  console.log("RewardCoin deployed to:", await rewardCoin.getAddress())

  // Deploy RewardVault
  console.log("\n2. Deploying RewardVault...")
  const RewardVault = await ethers.getContractFactory("RewardVault")
  const rewardVault = await RewardVault.deploy(await rewardCoin.getAddress(), deployer.address)
  await rewardVault.waitForDeployment()
  console.log("RewardVault deployed to:", await rewardVault.getAddress())

  // Fund the vault with initial SHM
  console.log("\n3. Funding RewardVault with initial SHM...")
  const fundingAmount = ethers.parseEther("10") // 10 SHM
  const fundTx = await rewardVault.fundVault({ value: fundingAmount })
  await fundTx.wait()
  console.log("Vault funded with 10 SHM")

  // Add RewardVault as authorized minter
  console.log("\n4. Setting up permissions...")
  const addMinterTx = await rewardCoin.addMinter(deployer.address)
  await addMinterTx.wait()
  console.log("Deployer added as authorized minter")

  console.log("\n✅ Deployment completed!")
  console.log("📋 Contract Addresses:")
  console.log("RewardCoin (RWD):", await rewardCoin.getAddress())
  console.log("RewardVault:", await rewardVault.getAddress())
  console.log("\n💡 Next steps:")
  console.log("1. Update frontend with contract addresses")
  console.log("2. Add PayLink backend as authorized minter")
  console.log("3. Test reward minting and redemption")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
