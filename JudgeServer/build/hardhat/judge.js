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
  return '/playground'
}

console.log(getWorkDir())
console.log(getTmpDir())


process.env['HOME'] = getTmpDir();
process.chdir(getWorkDir())



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
    const lsResult = execSync(`ls`)
    console.log(lsResult.toString())

    const output = execSync(`npx hardhat --config ${getConfigPath()} test`)
    return output.toString()
  // } catch (err) {
  //   console.log(err.stdout.toString())
  //   console.log(err.stderr.toString())

  //   return err.stdout.toString()
  // }
}

// const contract = loadContract();
// const test = loadTest();
// setContract(contract)
// setTest(test)
const result = getTestResult();
console.log(result)

// result['stats']['tests'] = 

// "stats": {
//   "suites": 6,
//   "tests": 9,
//   "passes": 9,
//   "pending": 0,
//   "failures": 0,
//   "start": "2023-03-12T11:03:02.774Z",
//   "end": "2023-03-12T11:03:04.728Z",
//   "duration": 1954
// },



// clearEnv()
