const { execSync } = require('node:child_process');
const fs = require('fs');
const path = require('path');

const JudgeResult = {
  WrongAnswer: -1,
  Accepted: 0,
}

const getWorkDir = () => {
  return __dirname
}

const getTmpDir = () => {
  return path.join(getWorkDir(), 'tmp')
}

process.env['HOME'] = getTmpDir();
process.chdir(getWorkDir())

const loadContract = () => {
  const contractPath = process.argv[2]
  if (!contractPath) {
    throw new Error('contract is required')
  }

  return fs.readFileSync(contractPath, { 'encoding': 'utf-8' }).toString();
}

const loadTest = () => {
  const test = process.argv[3]
  const input = fs.readFileSync('/dev/stdin').toString();
  
  if (test) {
    return test.replace('\\n', '\n');
  }

  if (input) {
    return input
  }

  throw new Error('test is required')
}

const setContract = (contract) => {
  const contratPath = path.join(getWorkDir(), 'contracts', 'Contract.sol')
  fs.writeFileSync(contratPath, contract, { encoding : 'utf8', mode: '777' })
}

const setTest = (test) => {
  const testPath = path.join(getWorkDir(), 'test', 'test.js')
  fs.writeFileSync(testPath, test, { encoding : 'utf8', mode: '777' })
}

const clearEnv = () => {
  const contractPath = path.join(getWorkDir(), 'contracts', 'Contract.sol')
  const testPath = path.join(getWorkDir(), 'test', 'test.js')

  const buildFile = path.join(getWorkDir(), 'artifacts')
  const cacheFile = path.join(getWorkDir(), 'cache')
  const typeFile = path.join(getWorkDir(), 'typechain-types')

  fs.rmSync(contractPath)
  fs.rmSync(testPath)
  fs.rmdirSync(buildFile, { recursive: true })
  fs.rmdirSync(cacheFile, { recursive: true })
  fs.rmdirSync(typeFile, { recursive: true })

  fs.rmdirSync(getTmpDir(), { recursive: true })
}

const getConfigPath = () => {
  return path.join(getWorkDir(), 'hardhat.config.js')
}

const getTestResult = () => {
  try {
    const output = execSync(`npx hardhat --config ${getConfigPath()} test`)
    return output.toString()
  } catch (err) {
    return err.stdout.toString()
  }
}

const contract = loadContract();
const test = loadTest();

setContract(contract)
setTest(test)
const text = getTestResult();

try {
  const result = JSON.parse(text)
  if (result?.stats?.tests === result?.stats?.passes) {
    console.log(JudgeResult.Accepted)
  } else {
    console.log(JudgeResult.WrongAnswer)
  }
} catch {
  console.log(JudgeResult.WrongAnswer)
}

clearEnv()