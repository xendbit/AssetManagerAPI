import { Injectable, Logger } from '@nestjs/common';
import { mnemonicToSeedSync } from 'bip39';
import { hdkey } from 'ethereumjs-wallet';
import EthereumHDKey from 'ethereumjs-wallet/dist/hdkey';
import Web3 from 'web3';
import { AES, enc } from 'crypto-js';
import { Transaction, TxData } from 'ethereumjs-tx';
import Common from 'ethereumjs-common';
import { TokenShares } from 'src/models/token.shares';
import { Order } from 'src/models/order.model';
import { User } from 'src/models/user.model';
import { OrderRequest } from 'src/request.objects/order.request';
import { AssetRequest } from 'src/request.objects/asset-request';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path')
// eslint-disable-next-line @typescript-eslint/no-var-requires
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
        this.contractorPK = Buffer.from(process.env.CONTRACTOR_KEY, 'hex');
        this.contractor = process.env.CONTRACTOR;

        this.web3 = new Web3(process.env.WEB3_URL);
        this.abi = JSON.parse(fs.readFileSync(path.resolve('src/etc/AssetManagerV2.json'), 'utf8')).abi;
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.chain = Common.forCustomChain(
            'mainnet',
            {
                name: 'Binance Teste Chain',
                networkId: 97,
                chainId: 97,
            },
            'byzantium',
        );

        // this.chain = Common.forCustomChain(
        //     'mainnet',
        //     {
        //         name: 'xend-chain',
        //         networkId: 1337,
        //         chainId: 1337,
        //     },
        //     'istanbul',
        // );
    }

    getOrder(key: string): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {

                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });
                const blOrder = await contract.methods.getOrder(key).call();
                const order: Order = {
                    amountRemaining: blOrder.amountRemaining,
                    buyer: blOrder.buyer,
                    goodUntil: blOrder.goodUntil * 1000,
                    key: key,
                    orderStrategy: blOrder.orderStrategy,
                    orderType: blOrder.orderType,
                    originalAmount: blOrder.originalAmount,
                    price: blOrder.price,
                    seller: blOrder.seller,
                    status: blOrder.status,
                    tokenId: blOrder.tokenId,
                };

                resolve(order);
            } catch (error) {
                reject(error);
            }
        });
    }

    postOrder(or: OrderRequest, user: User): Promise<string> {
        const goodUntil = new Date(or.goodUntil).getTime() / 1000;        
        return new Promise(async (resolve, reject) => {
            try {
                const poster = this.getAddressFromEncryptedPK(user.passphrase);                
                const nonce: number = await this.web3.eth.getTransactionCount(poster.address);
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: poster.address });
            
                const rawTransaction: TxData = {                    
                    gasPrice: this.web3.utils.toHex(process.env.GAS_PRICE),
                    gasLimit: this.web3.utils.toHex(process.env.GAS_LIMIT),
                    to: this.contractAddress,
                    value: "0x0",
                    data: contract.methods.postOrder(
                        or.orderType,
                        or.orderStrategy,
                        or.amount,
                        or.price,
                        or.tokenId,
                        or.goodUntil,
                        or.key,
                        or.market
                    ).encodeABI(),
                    nonce: this.web3.utils.toHex(nonce),
                }

                const transaction = new Transaction(rawTransaction, { common: this.chain });
                //const transaction = new Transaction(rawTransaction, { chain:  3});
                transaction.sign(poster.privateKey);
                const reciept = await this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                resolve(reciept.transactionHash);
            } catch (error) {
                reject(error);
            }
        });
    }

    getTokenShares(tokenId: number): Promise<TokenShares> {
        return new Promise(async (resolve, reject) => {
            try {
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });
                const res = await contract.methods.tokenShares(tokenId).call();
                const tokenShares: TokenShares = {
                    description: res.description,
                    issuer: res.issuer,
                    issuingPrice: res.issuingPrice,
                    owner: res.owner,
                    sharesContract: res.sharesContract,
                    symbol: res.symbol,
                    tokenId: res.tokenId,
                    totalSupply: res.totalSupply,
                    approved: 0
                }
                resolve(tokenShares);
            } catch (error) {
                reject(error);
            }
        });
    }

    async transferTokenOwnership(tokenId: number, newOwner: string | number, previousOwner: Address): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const nonce: number = await this.web3.eth.getTransactionCount(this.contractor);
                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: previousOwner.address });

                const rawTransaction: TxData = {
                    gasPrice: this.web3.utils.toHex(process.env.GAS_PRICE),
                    gasLimit: this.web3.utils.toHex(process.env.GAS_LIMIT),
                    to: this.contractAddress,
                    value: "0x0",
                    data: contract.methods.transferTokenOwnership(tokenId, newOwner).encodeABI(),
                    nonce: this.web3.utils.toHex(nonce),
                }

                const transaction = new Transaction(rawTransaction, { common: this.chain });
                //const transaction = new Transaction(rawTransaction, { chain:  3});
                transaction.sign(this.contractorPK);
                const reciept = await this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                resolve(reciept.transactionHash);
            } catch (error) {
                reject(error);
            }
        });
    }

    // minting
    issueToken(ar: AssetRequest, transferOwnershipToIssuer: boolean): Promise<string> {       
        this.logger.debug(ar);
        return new Promise(async (resolve, reject) => {
            try {
                const nonce: number = await this.web3.eth.getTransactionCount(this.contractor);
                this.logger.debug(`Transaction Count: ${nonce}`);

                const contract = new this.web3.eth.Contract(this.abi, this.contractAddress, { from: this.contractor });
                const rawTransaction: TxData = {
                    gasPrice: this.web3.utils.toHex(process.env.GAS_PRICE),
                    gasLimit: this.web3.utils.toHex(process.env.GAS_LIMIT),
                    to: this.contractAddress,
                    value: "0x0",
                    data: contract.methods.mint(
                        ar.tokenId,
                        ar.symbol,
                        ar.totalSupply,
                        ar.issuingPrice,
                        ar.issuer                        
                    ).encodeABI(),
                    nonce: this.web3.utils.toHex(nonce),
                }

                this.logger.debug(rawTransaction);
                const transaction = new Transaction(rawTransaction, { common: this.chain });
                //const transaction = new Transaction(rawTransaction, { chain:  3});
                transaction.sign(this.contractorPK);
                const reciept = await this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex'))
                resolve(reciept.transactionHash);
            } catch (error) {
                reject(error);
            }
        });
    }

    getAddressFromEncryptedPK(encrypted: string): Address {
        const passphrase = AES.decrypt(encrypted, process.env.KEY).toString(enc.Utf8);
        return this.getAddress(passphrase);
    }

    getAddress(passphrase: string): Address {
        const seed: Buffer = mnemonicToSeedSync(passphrase);
        const root: EthereumHDKey = hdkey.fromMasterSeed(seed);
        const path = "m/44'/60'/0'/0/0";
        const addrNode: EthereumHDKey = root.derivePath(path);
        const pk: Buffer = addrNode.getWallet().getPrivateKey();
        this.logger.debug(addrNode.getWallet().getAddressString());        
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

                const rawTransaction: TxData = {
                    gasPrice: this.web3.utils.toHex(process.env.GAS_PRICE),
                    gasLimit: this.web3.utils.toHex(process.env.GAS_LIMIT),
                    to: this.contractAddress,
                    value: "0x0",
                    data: contract.methods.fundWallet(recipient, amountHex).encodeABI(),
                    nonce: this.web3.utils.toHex(nonce),
                }

                this.logger.debug(rawTransaction);
                const transaction = new Transaction(rawTransaction, { common: this.chain });
                transaction.sign(this.contractorPK);
                this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')).then(x => {
                    this.logger.debug(`Account funding succcessul`);
                    // Give the user some xDAI if they don't already have it.
                    this._giveGas(recipient);
                })
                resolve("Success");
            } catch (error) {
                reject(error);
            }
        });
    }

    private async _giveGas(address: string) {
        this.logger.debug("checking if user require gas");
        const availableGas: number = +this.web3.utils.fromWei(await this.web3.eth.getBalance(address), 'ether').toString();
        this.logger.debug(`availableGas: ${availableGas}`);
        if(availableGas < +process.env.DAI_LOW_GAS_LIMIT) {
            // gas depleted, give some gas
            this.logger.debug(`Gas Depleted, Giving ${address} some gas`);
            const xendPK = this.contractorPK;
            const xendAddress = this.contractor;

            const nonce: number = await this.web3.eth.getTransactionCount(xendAddress);

            var rawTransaction: TxData = {
                gasPrice: this.web3.utils.toHex(process.env.GAS_PRICE),
                gasLimit: this.web3.utils.toHex(process.env.GAS_LIMIT),
            to: address,
                value: this.web3.utils.toHex(this.web3.utils.toWei(process.env.DAI_LOW_GAS_LIMIT, "ether")),
                nonce: this.web3.utils.toHex(nonce)
            }
         
            const transaction = new Transaction(rawTransaction, {common: this.chain});       
            transaction.sign(xendPK);
            this.web3.eth.sendSignedTransaction('0x' + transaction.serialize().toString('hex')).then(x => {
                this.logger.debug(`Gas funding for ${address} successful`);
            }); 
        } 
    }    
}



export class Address {
    address: string;
    privateKey: Buffer;
}