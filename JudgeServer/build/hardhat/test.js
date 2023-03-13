const { execSync } = require('node:child_process')
const fs = require('fs')
const path = require('path')
const { fileURLToPath } = require('url');

const loadContract = () => {
  const contract = process.argv[2]
  if (!contract) {
    throw new Error('contract is required')
  }

  return contract.split('\\n').join('\n')
}

const loadTest = () => {
  const contract = process.argv[3]
  if (!contract) {
    throw new Error('test is required')
  }

  return contract.split('\\n').join('\n')
}

const getWorkDir = () => {
  return __dirname
}

const getTmpDir = () => {
  return __dirname
}

process.env['HOME'] = getTmpDir();

const setContract = (contract) => {
  const contratPath = path.join(getWorkDir(), 'contracts', 'Contract.sol')
  fs.writeFileSync(contratPath, contract, { encoding : 'utf8' })
}

const setTest = (test) => {
  const testPath = path.join(getWorkDir(), 'test', 'test.js')
  fs.writeFileSync(testPath, test, { encoding : 'utf8' })
}

const clearEnv = () => {
  const contractPath = path.join(getWorkDir(), 'contracts', 'Contract.sol')
  const testPath = path.join(getWorkDir(), 'test', 'test.js')

  const buildFile = path.join(getTmpDir(), 'artifacts')
  const localFile = path.join(getTmpDir(), '.local')
  const cacheFile = path.join(getTmpDir(), 'cache')
  const dotCacheFile = path.join(getTmpDir(), '.cache')
  const dotConfigFile = path.join(getTmpDir(), '.config')
  const typeFile = path.join(getTmpDir(), 'typechain-types')

  fs.rmSync(contractPath)
  fs.rmSync(testPath)
  fs.rmdirSync(buildFile, { recursive: true })
  fs.rmdirSync(localFile, { recursive: true })
  fs.rmdirSync(cacheFile, { recursive: true })
  fs.rmdirSync(dotCacheFile, { recursive: true })
  fs.rmdirSync(typeFile, { recursive: true })
  fs.rmdirSync(dotConfigFile, { recursive: true })
}

const getConfigPath = () => {
  return path.join(getWorkDir(), 'hardhat.config.js')
}

const getTestResult = () => {
  // try {
    const output = execSync(`npx hardhat --config ${getConfigPath()} test`)
    return output.toString()
  // } catch (err) {
  //   return err.stdout.toString()
  // }
}

const result = getTestResult();
console.log(result)
