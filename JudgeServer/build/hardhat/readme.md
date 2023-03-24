``` json
{
  "language_config": {
    "run": {
      "env": [
        "LANG=en_US.UTF-8",
        "LANGUAGE=en_US:en",
        "LC_ALL=en_US.UTF-8"
      ],
      "command": "/bin/usr/node /hardhat/judge.js {exe_path}",
      "seccomp_rule": "general",
      "run_args": "const { time, loadFixture } = require(\"@nomicfoundation/hardhat-network-helpers\");\nconst { expect } = require(\"chai\");\ndescribe(\"Lock\", function () {\n  async function deployOneYearLockFixture() {\n    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;\n    const ONE_GWEI = 1_000_000_000;\n    const lockedAmount = ONE_GWEI;\n    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;\n    const [owner, otherAccount] = await ethers.getSigners();\n    const Lock = await ethers.getContractFactory(\"Lock\");\n    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });\n    return { lock, unlockTime, lockedAmount, owner, otherAccount };\n  }\n  describe(\"Deployment\", function () {\n    it(\"Should set the right unlockTime\", async function () {\n      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);\n\n      expect(await lock.unlockTime()).to.equal(unlockTime);\n    });\n  });\n});"
    },
  },
  "src": "// SPDX-License-Identifier: UNLICENSED\npragma solidity ^0.8.9;\n\ncontract Lock {\n    uint public unlockTime;\n    address payable public owner;\n\n    event Withdrawal(uint amount, uint when);\n\n    constructor(uint _unlockTime) payable {\n        require(\n            block.timestamp < _unlockTime,\n            \"Unlock time should be in the future\"\n        );\n\n        unlockTime = _unlockTime;\n        owner = payable(msg.sender);\n    }\n\n    function withdraw() public {\n        require(block.timestamp >= unlockTime, \"You can't withdraw yet\");\n        require(msg.sender == owner, \"You aren't the owner\");\n\n        emit Withdrawal(address(this).balance, block.timestamp);\n\n        owner.transfer(address(this).balance);\n    }\n}", // 下方solidity代码
  "max_cpu_time": 1000,
  "max_memory": 134217728,
  "output": false,
  "spj_version": "9df0cae202fd3888d6bf26b7f9087185",
  "spj_config": {
    "command": "{exe_path} {in_file_path} {user_out_file_path}",
    "exe_name": "spj-{spj_version}",
    "seccomp_rule": "c_cpp"
  },
  "spj_compile_config": {
    "exe_name": "spj-{spj_version}",
    "src_name": "spj-{spj_version}.c",
    "max_memory": 1073741824,
    "max_cpu_time": 3000,
    "max_real_time": 10000,
    "compile_command": "/usr/bin/gcc -DONLINE_JUDGE -O2 -w -fmax-errors=3 -std=c11 {src_path} -lm -o {exe_path}"
  },
  "spj_src": "#include <stdio.h>\nint main(int argc, char *args[]){\n    FILE *user_output = NULL;\n    int result;\n    if(argc != 3){\n        return -1;\n    }\n    user_output = fopen(args[2], \"r\");\n    return user_output\n}", // 下方spj code的代码
  "io_mode": {
    "input": "input.txt",
    "output": "output.txt",
    "io_mode": "Standard IO"
  }
}
```

## spj code
``` c
#include <stdio.h>

int main(int argc, char *args[]){
    FILE *user_output = NULL;
    int result;
    if(argc != 3){
        printf("Usage: spj x.in x.out\n");
        return ERROR;
    }
    user_output = fopen(args[2], "r");
    return user_output
}
```



## sol code
```sol
// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Lock {
    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);

    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");

        emit Withdrawal(address(this).balance, block.timestamp);

        owner.transfer(address(this).balance);
    }
}
```

## test code
```js
const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
    const ONE_GWEI = 1_000_000_000;

    const lockedAmount = ONE_GWEI;
    const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const Lock = await ethers.getContractFactory("Lock");
    const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

    return { lock, unlockTime, lockedAmount, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right unlockTime", async function () {
      const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.unlockTime()).to.equal(unlockTime);
    });

    it("Should set the right owner", async function () {
      const { lock, owner } = await loadFixture(deployOneYearLockFixture);

      expect(await lock.owner()).to.equal(owner.address);
    });

    it("Should receive and store the funds to lock", async function () {
      const { lock, lockedAmount } = await loadFixture(
        deployOneYearLockFixture
      );

      expect(await ethers.provider.getBalance(lock.address)).to.equal(
        lockedAmount
      );
    });

    it("Should fail if the unlockTime is not in the future", async function () {
      // We don't use the fixture here because we want a different deployment
      const latestTime = await time.latest();
      const Lock = await ethers.getContractFactory("Lock");
      await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
        "Unlock time should be in the future"
      );
    });
  });

  describe("Withdrawals", function () {
    describe("Validations", function () {
      it("Should revert with the right error if called too soon", async function () {
        const { lock } = await loadFixture(deployOneYearLockFixture);

        await expect(lock.withdraw()).to.be.revertedWith(
          "You can't withdraw yet"
        );
      });

      it("Should revert with the right error if called from another account", async function () {
        const { lock, unlockTime, otherAccount } = await loadFixture(
          deployOneYearLockFixture
        );

        // We can increase the time in Hardhat Network
        await time.increaseTo(unlockTime);

        // We use lock.connect() to send a transaction from another account
        await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
          "You aren't the owner"
        );
      });

      it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
        const { lock, unlockTime } = await loadFixture(
          deployOneYearLockFixture
        );

        // Transactions are sent using the first signer by default
        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).not.to.be.reverted;
      });
    });

    describe("Events", function () {
      it("Should emit an event on withdrawals", async function () {
        const { lock, unlockTime, lockedAmount } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw())
          .to.emit(lock, "Withdrawal")
          .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
      });
    });

    describe("Transfers", function () {
      it("Should transfer the funds to the owner", async function () {
        const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
          deployOneYearLockFixture
        );

        await time.increaseTo(unlockTime);

        await expect(lock.withdraw()).to.changeEtherBalances(
          [owner, lock],
          [lockedAmount, -lockedAmount]
        );
      });
    });
  });
});

```