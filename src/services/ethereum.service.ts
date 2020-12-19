import { CACHE_MODULE_OPTIONS, Injectable, Logger } from '@nestjs/common';
import { mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import Web3 from 'web3';
import { AES, enc } from 'crypto-js';
import { Transaction, TxData } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';

const path = require('path')
const fs = require('fs')

@Injectable()
export class EthereumService {
    web3: Web3;
    abi;
    contractAddress: string;
    private readonly logger = new Logger(EthereumService.name);
    contractorPK: Buffer;
    contractor: string;
    chain: Common;

    constructor() {
        this.contractorPK = Buffer.from('d50bac9fe4f8b1f67b807b33e4b02c789c5845fb613dd1eccf17d49af681dced', 'hex');
        this.contractor = process.env.CONTRACTOR;

        this.web3 = new Web3(process.env.WEB3_URL);
        const abi = JSON.parse(fs.readFileSync(path.resolve(process.env.ABI_PATH), 'utf8'));
        this.abi = abi.abi;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.chain = Common.forCustomChain(
            'mainnet',
            {
                name: 'xend-chain',
                networkId: 1337,
                chainId: 1337,
            },
            'istanbul',
        );
    }

    getAddressFromEncryptedPK(encrypted: string): Address {
        this.logger.debug(encrypted);
        const passphrase = AES.decrypt(encrypted, process.env.KEY).toString(enc.Utf8);
        return this.getAddress(passphrase);
    }

    getAddress(passphrase: string): Address {
        const seed: Buffer = mnemonicToSeedSync(passphrase);
        const root: EthereumHDKey = hdkey.fromMasterSeed(seed);
        var path = "m/44'/60'/0'/0/0";
        const addrNode: EthereumHDKey = root.derivePath(path);
        const pk: Buffer = addrNode.getWallet().getPrivateKey();
        return {
            address: addrNode.getWallet().getAddressString(),
            privateKey: pk
        }
    }

    async getOwnedShares(tokenId: number, address: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });
                const balance = await contract.methods.ownedShares(tokenId, address).call();
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });        
    }

    async getWalletBalance(address: string): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });
                const balance = await contract.methods.walletBalance(address).call();
                resolve(balance);
            } catch (error) {
                reject(error);
            }
        });
    }

    async fundWallet(recipient: string, amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const amountHex = this.web3.utils.toHex(amount);
                const nonce: number = await this.web3.eth.getTransactionCount(this.contractor);
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });

                var rawTransaction: TxData = {
                    gasPrice: this.web3.utils.toHex(0),
                    gasLimit: this.web3.utils.toHex(210000),
                    to: this.contractAddress,
                    value: "0x0",
                    data: contract.methods.fundWallet(recipient, amountHex).encodeABI(),
                    nonce: this.web3.utils.toHex(nonce),
                }

                const transaction = new Transaction(rawTransaction, { common: this.chain });
                transaction.sign(this.contractorPK);
                const reciept = await this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                resolve(reciept.transactionHash);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export class Address {
    address: string;
    privateKey: Buffer;
}
