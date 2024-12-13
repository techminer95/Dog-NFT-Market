import { ethers } from "hardhat";

async function main() {
    // Get the signer that we will use to deploy
    const [deployer] = await ethers.getSigners();

    console.log("Deployer Address:", deployer.address);

    // Fetch the ETH balance of the deployer before deploying the contract
    const deployerBalanceBefore = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer ETH Balance Before Deployment:", ethers.formatEther(deployerBalanceBefore));

    // Get the NFTMarketplace smart contract object and deploy it
    const Marketplace = await ethers.getContractFactory("NFTMarketplace");
    const marketplace = await Marketplace.deploy();

    await marketplace.waitForDeployment();

    console.log("NFTMarketplace Contract Deployed At:", marketplace.target);

    const deployerBalanceAfter = await ethers.provider.getBalance(deployer.address);
    console.log("Deployer ETH Balance After Deployment:", ethers.formatEther(deployerBalanceAfter));
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
