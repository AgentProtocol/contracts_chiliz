const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ContractMe", function () {
    let ContractMe, contractMe, owner, user1, user2;

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();
        
        // Deploy contract
        ContractMe = await ethers.getContractFactory("ContractMe");
        contractMe = await ContractMe.deploy();
        await contractMe.deployed();
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await contractMe.owner()).to.equal(owner.address);
        });

        it("Should set the correct base fee", async function () {
            expect(await contractMe.baseFee()).to.equal(ethers.utils.parseEther("2.5"));
        });

        it("Should initialize with zero buy-ins", async function () {
            expect(await contractMe.buyInCount()).to.equal(0);
            expect(await contractMe.totalBuyIns()).to.equal(0);
        });

        it("Should initialize with zero prize pool", async function () {
            expect(await contractMe.prizePool()).to.equal(0);
            expect(await contractMe.prizePoolAmount()).to.equal(0);
        });
    });

    describe("Action Cost Calculation", function () {
        it("Should return base fee for first buy-in", async function () {
            const cost = await contractMe.actionCost();
            expect(cost).to.equal(ethers.utils.parseEther("2.5"));
        });

        it("Should increase cost after buy-ins", async function () {
            const initialCost = await contractMe.actionCost();
            
            // First buy-in
            await contractMe.connect(user1).buyIn({ value: initialCost });
            
            const newCost = await contractMe.actionCost();
            expect(newCost).to.be.gt(initialCost);
        });
    });

    describe("Buy-in Functionality", function () {
        it("Should allow buy-in with correct payment", async function () {
            const cost = await contractMe.actionCost();
            
            await expect(contractMe.connect(user1).buyIn({ value: cost }))
                .to.emit(contractMe, "BuyIn")
                .withArgs(user1.address, cost, 1);
        });

        it("Should reject buy-in with insufficient payment", async function () {
            const cost = await contractMe.actionCost();
            const insufficientAmount = cost.sub(ethers.utils.parseEther("0.1"));
            
            await expect(contractMe.connect(user1).buyIn({ value: insufficientAmount }))
                .to.be.revertedWith("Insufficient payment");
        });

        it("Should split payment correctly (95% to prize pool, 5% to owner)", async function () {
            const cost = await contractMe.actionCost();
            
            await contractMe.connect(user1).buyIn({ value: cost });
            
            const expectedPrizePool = cost.mul(95).div(100);
            const expectedOwnerFees = cost.mul(5).div(100);
            
            expect(await contractMe.prizePool()).to.equal(expectedPrizePool);
            expect(await contractMe.ownerFees()).to.equal(expectedOwnerFees);
        });

        it("Should refund excess payment", async function () {
            const cost = await contractMe.actionCost();
            const excessPayment = cost.add(ethers.utils.parseEther("1"));
            
            const balanceBefore = await user1.getBalance();
            const tx = await contractMe.connect(user1).buyIn({ value: excessPayment });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
            
            const balanceAfter = await user1.getBalance();
            const expectedBalance = balanceBefore.sub(cost).sub(gasUsed);
            
            expect(balanceAfter).to.equal(expectedBalance);
        });
    });

    describe("Prize Pool Funding", function () {
        it("Should allow anyone to fund the prize pool", async function () {
            const fundAmount = ethers.utils.parseEther("5");
            
            await expect(contractMe.connect(user1).fundPrizePool({ value: fundAmount }))
                .to.emit(contractMe, "PrizeFunded")
                .withArgs(user1.address, fundAmount);
            
            expect(await contractMe.prizePool()).to.equal(fundAmount);
        });

        it("Should reject funding with zero amount", async function () {
            await expect(contractMe.connect(user1).fundPrizePool({ value: 0 }))
                .to.be.revertedWith("Amount must be greater than 0");
        });
    });

    describe("Owner Functions", function () {
        beforeEach(async function () {
            // Add some funds to the contract
            const cost = await contractMe.actionCost();
            await contractMe.connect(user1).buyIn({ value: cost });
        });

        it("Should allow owner to make payouts", async function () {
            const payoutAmount = ethers.utils.parseEther("1");
            
            await expect(contractMe.payout(user2.address, payoutAmount))
                .to.emit(contractMe, "Payout")
                .withArgs(user2.address, payoutAmount);
        });

        it("Should prevent payout exceeding prize pool", async function () {
            const prizePool = await contractMe.prizePool();
            const excessiveAmount = prizePool.add(ethers.utils.parseEther("1"));
            
            await expect(contractMe.payout(user2.address, excessiveAmount))
                .to.be.revertedWith("Insufficient prize pool");
        });

        it("Should allow owner to withdraw owner fees", async function () {
            const ownerFees = await contractMe.ownerFees();
            
            await expect(contractMe.withdrawOwnerFees())
                .to.emit(contractMe, "OwnerFeesWithdrawn")
                .withArgs(owner.address, ownerFees);
            
            expect(await contractMe.ownerFees()).to.equal(0);
        });

        it("Should allow owner to reset cost", async function () {
            await expect(contractMe.resetCost())
                .to.emit(contractMe, "CostReset")
                .withArgs(0);
            
            expect(await contractMe.buyInCount()).to.equal(0);
        });

        it("Should allow owner to drain contract", async function () {
            const prizePool = await contractMe.prizePool();
            const ownerFees = await contractMe.ownerFees();
            
            await expect(contractMe.drain())
                .to.emit(contractMe, "ContractDrained")
                .withArgs(prizePool, ownerFees);
            
            expect(await contractMe.prizePool()).to.equal(0);
            expect(await contractMe.ownerFees()).to.equal(0);
            expect(await contractMe.buyInCount()).to.equal(0);
        });

        it("Should allow owner to update base fee", async function () {
            const newBaseFee = ethers.utils.parseEther("5");
            const oldBaseFee = await contractMe.baseFee();
            
            await expect(contractMe.updateBaseFee(newBaseFee))
                .to.emit(contractMe, "BaseFeeUpdated")
                .withArgs(oldBaseFee, newBaseFee);
            
            expect(await contractMe.baseFee()).to.equal(newBaseFee);
        });
    });

    describe("Access Control", function () {
        it("Should prevent non-owner from calling owner functions", async function () {
            await expect(contractMe.connect(user1).payout(user2.address, 1000))
                .to.be.revertedWith("Not the owner");
            
            await expect(contractMe.connect(user1).resetCost())
                .to.be.revertedWith("Not the owner");
            
            await expect(contractMe.connect(user1).drain())
                .to.be.revertedWith("Not the owner");
        });
    });

    describe("Pause Functionality", function () {
        it("Should allow owner to pause and unpause", async function () {
            await contractMe.togglePause();
            expect(await contractMe.paused()).to.equal(true);
            
            await contractMe.togglePause();
            expect(await contractMe.paused()).to.equal(false);
        });
    });

    describe("Contract Balance", function () {
        it("Should track contract balance correctly", async function () {
            const cost = await contractMe.actionCost();
            await contractMe.connect(user1).buyIn({ value: cost });
            
            const balance = await contractMe.getContractBalance();
            expect(balance).to.equal(cost);
        });
    });
}); 