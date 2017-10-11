const fs = require('fs')
const solc = require('solc')
const Web3 = require('web3')

const config = require('./config.json')
const definitionFile = './build/ATT.def.json'

const sources = {
  'ERC20Token.sol': fs.readFileSync('./contracts/ERC20Token.sol', 'utf8'),
  'MiniMeToken.sol': fs.readFileSync('./contracts/MiniMeToken.sol', 'utf8'),
  'ATT.sol': fs.readFileSync('./contracts/ATT.sol', 'utf8')
}

const {
  contracts: { 'ATT.sol:ATT': { bytecode } },
  contracts: { 'ATT.sol:ATT': { interface } },
} = solc.compile({ sources }, 1)

const {
  endpoint,
  account,
  cost
} = config

const provider = new Web3
  .providers
  .HttpProvider(endpoint)
const web3 = new Web3(provider)

const options = {
  data: '0x' + bytecode,
  from: account.address,
  gas: cost.gas || 4700000,
}

web3
  .personal
  .unlockAccount(account.address, account.password)

const abi = JSON.parse(interface)

const contract = web3
  .eth
  .contract(abi)
  .new(options, (err, res) => {
    const address = res.address
    if (address) {
      const definition = {
        address,
        abi,
        bytecode,
      }
      fs.writeFileSync(definitionFile, JSON.stringify(definition))
      console.log(`Deploy contract [ATT] done!`)
      console.log(`Contract bstraction saved to './build/ATT.def.json'`)
    }
  })
