import { expect } from "chai";
import { ethers } from "hardhat";
import { VectorDBProposalGovernancer } from "../typechain-types";

describe("VectorDBProposalGovernancer", function () {
  // We define a fixture to reuse the same setup in every test.

  let VectorDBProposalGovernancer: VectorDBProposalGovernancer;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const VectorDBProposalGovernancerFactory = await ethers.getContractFactory("VectorDBProposalGovernancer");
    VectorDBProposalGovernancer = (await VectorDBProposalGovernancerFactory.deploy(owner.address)) as VectorDBProposalGovernancer;
    await VectorDBProposalGovernancer.deployed();
  });

  describe("Deployment", function () {
    it("Should have the right message on deploy", async function () {
      expect(await VectorDBProposalGovernancer.greeting()).to.equal("Building Unstoppable Apps!!!");
    });

    it("Should allow setting a new message", async function () {
      const newGreeting = "Learn Scaffold-ETH 2! :)";

      await VectorDBProposalGovernancer.setGreeting(newGreeting);
      expect(await VectorDBProposalGovernancer.greeting()).to.equal(newGreeting);
    });
  });
});
