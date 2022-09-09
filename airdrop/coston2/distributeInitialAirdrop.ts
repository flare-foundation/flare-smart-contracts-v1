import * as fs from 'fs';
import BigNumber from "bignumber.js";
import { logMessage, sleep } from '../flare/utils/utils';
const Web3 = require('web3');
const web3Eth = require("web3-eth");
const cliProgress = require('cli-progress');

import InitialAirdropAbi from "../../artifacts/contracts/genesis/implementation/InitialAirdrop.sol/InitialAirdrop.json";
import { InitialAirdrop } from "../../typechain-web3/InitialAirdrop";

let { argv } = require("yargs")
.scriptName("signAirdropTransactions")
.option("d", {
  alias: "deployment-name",
  describe: "Deployment file name (generated to deployment/deploys/ folder)",
  type: "string",
  demandOption: "Deployment name is required (-d or --deployment-name)",
  default: "deployment/deploys/flare.json",
  nargs: 1
})
.option("l", {
    alias: "log-path",
    describe: "log data path",
    type: "string",
    default: "airdrop/flare/files/logs/",
    nargs: 1
})
.option("q", {
    alias: "quiet",
    describe: "quiet",
    type: "boolean",
    default: "false",
    nargs: 1
})
.fail(function (msg:any, err:any, yargs:any) {
    if (err) throw err;
    console.error("Exiting with message")
    console.error(msg);
    console.error(yargs.help())
    process.exit(0);
})

async function main( deploymentName: string, logPath:string,  quiet:boolean = true) {
    let airdropTransferKey: string

    if (process.env.AIRDROP_TRANSFER_PRIVATE_KEY) {
        airdropTransferKey = process.env.AIRDROP_TRANSFER_PRIVATE_KEY
    }
    else {
        console.error("No AIRDROP_TRANSFER_PRIVATE_KEY provided in env");
        throw new Error("No AIRDROP_TRANSFER_PRIVATE_KEY provided in env");
    }

    console.log(deploymentName);
    

    if(!fs.existsSync(deploymentName)){
      console.error(`No file at ${deploymentName}`);
      throw new Error(`No file at ${deploymentName}`);
    } 

    let web3Provider = ""
    if (process.env.WEB3_PROVIDER_URL) {
        web3Provider = process.env.WEB3_PROVIDER_URL
    }
    else {
        console.error("No WEB3_PROVIDER_URL provided in env");
        throw new Error("No WEB3_PROVIDER_URL provided in env");
    }

    const rawDeploy = fs.readFileSync(deploymentName)
    const contractArray = JSON.parse(rawDeploy as any) as {name: string, contractName: string, address: string} []
    
    const InitialAirdropAddress = contractArray.find((elem) => elem.contractName === 'InitialAirdrop.sol')

    const web3 = new Web3(web3Provider);

    const InitialAirdropContract = new web3.eth.Contract(
      InitialAirdropAbi.abi,
      InitialAirdropAddress?.address || ''
    ) as any as InitialAirdrop;

    const now = new Date()
    const logFileName = logPath+`${now.toISOString()}_transferAirdrop_log.txt`;
    if(!quiet) console.log(logFileName);
    logMessage(logFileName, `Log file created at ${now.toISOString()} GMT(+0)`, quiet);
    logMessage(logFileName, `Script run with `, quiet);
    logMessage(logFileName, `Initial Airdrop address: ${InitialAirdropAddress?.address} `, quiet);

    
    const AirdropSigner = web3.eth.accounts.privateKeyToAccount(airdropTransferKey);
    logMessage(logFileName, `signer public key (from AIRDROP_TRANSFER_PRIVATE_KEY.  in .env) : ${AirdropSigner.address}`, quiet);

    // TODO parametrize
    const numOfAcc = 142473
    const initialAirdropBatchSize = 50

    const numOfCalls = Math.ceil(numOfAcc/initialAirdropBatchSize)
    const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar1.start(numOfCalls, 0);
    for(let i = 0; i < numOfCalls; i++){
      
      try{
        await sleep(950);
        // const rec = await InitialAirdropContract.methods.transferAirdrop().send({from:AirdropSigner.address, gas: '8000000', gasPrice: '225000000000' })

        const call = InitialAirdropContract.methods.transferAirdrop()
        const options = {
          to: InitialAirdropAddress?.address || '',
          from: AirdropSigner.address,
          gas: '0x7A1200',
          gasPrice: '0x34630B8A00',
          chainId: '0x72',
          data: call.encodeABI()
        }

        // console.log(options);
        
        const signed = await AirdropSigner.signTransaction(options)

        // console.log(signed);
        
        const rec = await web3.eth.sendSignedTransaction(signed.rawTransaction)
        // console.log(rec);
      } catch(e) {
        console.log(e);
      }
      bar1.update(i);
    }
    bar1.stop();
    logMessage(logFileName, `Complete`, quiet);
}
  
const { quiet, logPath, deploymentName} = argv;
main( deploymentName, logPath, quiet )
.then(() => process.exit(0))
.catch(error => {
    console.error(error);
    process.exit(1);
});
  