require("@nomicfoundation/hardhat-toolbox");
const { subtask } = require("hardhat/internal/core/config/config-env");

subtask('compile:solidity:log:download-compiler-start', () => {})
subtask('compile:solidity:log:compilation-result', () => {})

module.exports = {
  solidity: "0.8.17",
  mocha: {
    reporter: 'json',
  }
};
