const CM = artifacts.require("CryptoMarriage");
const truffleAssert = require("truffle-assertions");
const {
  time, // Time helpers
} = require("@openzeppelin/test-helpers");
const { deployProxy } = require("@openzeppelin/truffle-upgrades");

contract("CryptoMarriage", async (accounts) => {
  let cm;
  describe("createMarriage tests", async () => {
    beforeEach(async () => {
      cm = await deployProxy(CM);
    });

    it("should not allow minter to mint with a reference time in the future", async () => {
      const now = await time.latest();
      await truffleAssert.reverts(
        cm.createMarriage(accounts[1], now + 10, ["abc.com", "de.fr"], [10], {
          from: accounts[0],
        }),
        "Reference time must be in the past"
      );
    });

    it("should allow minter to mint with a reference time in the past", async () => {
      const now = await time.latest();
      const result = await cm.createMarriage(
        accounts[1],
        now - 10,
        ["abc.com", "de.fr"],
        [10],
        {
          from: accounts[0],
        }
      );
      truffleAssert.eventEmitted(result, "Transfer");
    });

    it("should not allow non-minter to mint, even with a reference time in the past", async () => {
      const now = await time.latest();
      await truffleAssert.reverts(
        cm.createMarriage(accounts[1], now - 10, ["abc.com", "de.fr"], [10], {
          from: accounts[1],
        }),
        "Only minters can create marriages"
      );
    });

    it("should require _uris.length to equal _dayOffsets + 1", async () => {
      const now = await time.latest();
      await truffleAssert.reverts(
        cm.createMarriage(accounts[1], now - 10, ["abc.com"], [10]),
        "Number of uris must be equal to number of day offsets + 1"
      );
    });

    it("should require number of _dayOffsets to be grater than 0", async () => {
      const now = await time.latest();
      await truffleAssert.reverts(
        cm.createMarriage(accounts[1], now - 10, ["abc.com"], []),
        "Number of day offsets must be greater than 0"
      );
    });

    it("should require _dayOffsets to be strictly increasing", async () => {
      const now = await time.latest();
      await truffleAssert.reverts(
        cm.createMarriage(
          accounts[1],
          now - 10,
          ["abc.com", "def.fr", "abc.xyz"],
          [10, 10]
        ),
        "Day offsets must be strictly increasing"
      );
      await truffleAssert.reverts(
        cm.createMarriage(
          accounts[1],
          now - 10,
          ["abc.com", "def.fr", "abc.xyz"],
          [10, 9]
        ),
        "Day offsets must be strictly increasing"
      );
    });
  });

  describe("tokenUri tests", async () => {
    beforeEach(async () => {
      cm = await deployProxy(CM);
    });
    it("should return the correct token uri based on the time - simple case", async () => {
      const now = await time.latest();
      const result = await cm.createMarriage(
        accounts[1],
        now - 10,
        ["abc.com", "de.fr"],
        [10],
        {
          from: accounts[0],
        }
      );
      const tokenId = result.logs[0].args.tokenId;
      let uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "abc.com");
      await time.increase(time.duration.days(9));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "abc.com");
      await time.increase(time.duration.days(2));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "de.fr");
    });
    it("should return the correct token uri based on the time - more complex case", async () => {
      const now = await time.latest();
      const result = await cm.createMarriage(
        accounts[1],
        now - 10,
        [
          "abc.com",
          "def.com",
          "ghi.com",
          "jkl.com",
          "mno.com",
          "pqr.com",
          "stu.com",
          "vwx.com",
          "yz.com",
        ],
        [1, 30, 180, 365, 730, 1095, 1825, 3650],
        {
          from: accounts[0],
        }
      );
      const tokenId = result.logs[0].args.tokenId;
      let uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "abc.com");
      await time.increase(time.duration.hours(1));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "abc.com");
      await time.increase(time.duration.days(1));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "def.com");
      await time.increase(time.duration.days(29));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "ghi.com");
      await time.increase(time.duration.days(150));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "jkl.com");
      await time.increase(time.duration.days(185));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "mno.com");
      await time.increase(time.duration.days(1000000000));
      uri = await cm.tokenURI(tokenId);
      assert.equal(uri, "yz.com");
    });
  });

  describe("burn tests", async () => {
    beforeEach(async () => {
      cm = await deployProxy(CM);
    });

    it("should not allow non-owner to burn", async () => {
      const now = await time.latest();
      const result = await cm.createMarriage(
        accounts[1],
        now - 10,
        ["abc.com", "de.fr"],
        [10],
        {
          from: accounts[0],
        }
      );
      const tokenId = result.logs[0].args.tokenId;
      await truffleAssert.reverts(cm.burn(tokenId, { from: accounts[0] }));
    });

    it("should allow owner to burn", async () => {
      const now = await time.latest();
      const result = await cm.createMarriage(
        accounts[1],
        now - 10,
        ["abc.com", "de.fr"],
        [10],
        {
          from: accounts[0],
        }
      );
      const tokenId = result.logs[0].args.tokenId;
      const result2 = await cm.burn(tokenId, { from: accounts[1] });
      truffleAssert.eventEmitted(result2, "Transfer");
    });
  });
});
