// Deployment script for ContractMe contract
// This script can be used with web3.js or ethers.js to deploy on Chiliz Chain

const { ethers } = require("hardhat");

async function main() {
    console.log("Deploying ContractMe to Chiliz Chain...");
    
    // Get the ContractFactory and Signers
    const ContractMe = await ethers.getContractFactory("ContractMe");
    const [deployer] = await ethers.getSigners();
    
    console.log("Deploying with account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    
    // Deploy the contract
    const contractMe = await ContractMe.deploy();
    
    console.log("ContractMe deployed to:", contractMe.address);
    console.log("Transaction hash:", contractMe.deployTransaction.hash);
    
    // Wait for deployment to be mined
    await contractMe.deployed();
    
    console.log("Deployment confirmed!");
    console.log("Contract details:");
    console.log("- Address:", contractMe.address);
    console.log("- Owner:", await contractMe.owner());
    console.log("- Base Fee:", ethers.utils.formatEther(await contractMe.baseFee()), "CHZ");
    console.log("- Initial Action Cost:", ethers.utils.formatEther(await contractMe.actionCost()), "CHZ");
    
    return contractMe;
}

// Execute deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

module.exports = { main }; 