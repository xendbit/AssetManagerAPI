import { enc, AES } from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { NewAssetRequest } from '../models/request.objects/new-asset-request';
import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { Injectable, Logger } from '@nestjs/common';
import { Asset } from '../models/asset.model';
import Web3 from 'web3';
import path = require('path');
import fs = require('fs');

@Injectable()
export class AssetsService {
    private contractAddress: string;
    private abiPath: string;
    private abi;
    private AssetManagerContract;
    private web3;
    @InjectRepository(User)
    private userRepository: Repository<User>

    private readonly logger = new Logger(AssetsService.name);
    constructor() {
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.abiPath = process.env.ABI_PATH
        this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        this.web3 = new Web3(process.env.WEB3_URL);
        this.web3.eth.handleRevert = true;
        this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
    }

    async transferAsset(assetTransfer: AssetTransferRequest): Promise<Asset> {
        const query = "SELECT * FROM user WHERE userId = ?";
        const issuerUser = await this.userRepository.query(query, [assetTransfer.assetIssuerId]);
        if (issuerUser.length !== 1) {
            throw new Error(`Issuer with id ${assetTransfer.assetIssuerId} not found`);
        }
        const senderUser = await this.userRepository.query(query, [assetTransfer.senderId]);
        if (senderUser.length !== 1) {
            throw new Error(`Sender with id ${assetTransfer.senderId} not found`);
        }
        const recipientUser = await this.userRepository.query(query, [assetTransfer.recipientId]);
        if (recipientUser.length !== 1) {
            throw new Error(`Recipient with id ${assetTransfer.recipientId} not found`);
        }

        const from = senderUser[0].address;
        const to = recipientUser[0].address
        const assetName = assetTransfer.assetName;
        const assetIssuer = issuerUser[0].address;
        const password = AES.decrypt(senderUser[0].password, process.env.KEY).toString(enc.Utf8);
        const quantity = assetTransfer.quantity;
        const price = assetTransfer.price;

        return new Promise(async (resolve, reject) => {
            try {
                await this.web3.eth.personal.unlockAccount(from, password);
                this.logger.log(`Account ${from} unlocked`);
                await this.AssetManagerContract.methods.transferAsset(to, assetName, assetIssuer, quantity, price).send({ from: from, gasPrice: '0' });
                const res = await this.AssetManagerContract.methods.getAsset(assetName, assetIssuer, to).call({ from: to, gasPrice: '0' });
                resolve(Asset.assetFromResponse(res));
            } catch (e) {
                reject(e);
            }
        });
    }

    async createAsset(asset: NewAssetRequest): Promise<Asset> {
        const query = "SELECT * FROM user WHERE userId = ?";
        const issuerUser = await this.userRepository.query(query, [asset.issuerId]);
        if (issuerUser.length !== 1) {
            throw new Error(`Issuer with id ${asset.issuerId} not found`);
        }
        const issuer = issuerUser[0].address;
        const password = AES.decrypt(issuerUser[0].password, process.env.KEY).toString(enc.Utf8);

        return new Promise(async (resolve, reject) => {
            try {
                await this.web3.eth.personal.unlockAccount(issuer, password);
                this.logger.log(`Account ${issuer} unlocked`);
                const assetRequest = {
                    name: asset.name,
                    description: asset.description,
                    totalQuantity: asset.totalQuantity,
                    price: asset.price,
                    decimal: asset.decimal
                }

                await this.AssetManagerContract.methods.createAsset(assetRequest).send({ from: issuer, gasPrice: '0' });
                this.logger.log(`Asset ${asset.name} created`);
                const res = await this.AssetManagerContract.methods.getAsset(asset.name, issuer).call({ from: issuer, gasPrice: '0' });
                resolve(Asset.assetFromResponse(res));
            } catch (e) {
                reject(e);
            }
        });
    }

    getAssets(): Promise<Asset[]> {
        return new Promise((resolve, reject) => {
            this.AssetManagerContract.methods.getAssets().call({ from: process.env.DTSL_ADDRESS, gasPrice: '0' }).then(result => {
                const allAssets = [];
                for (const res of result) {
                    if (res.id >= 0) {
                        allAssets.push(Asset.assetFromResponse(res));
                    }
                }

                resolve(allAssets);
            }, error => {
                reject(error);
            });
        });
    }
}
