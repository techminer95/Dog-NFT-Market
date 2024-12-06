import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
  import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
  import { expect } from "chai";
  import hre from "hardhat";

  describe("NFTMarketplace", function () {
    async function deployMarket() {
        const NFTMarketplace= await hre.ethers.getContractFactory("NFTMarketPlace");
        const nftMarketPlace = await NFTMarketplace.deploy();
    }
  })