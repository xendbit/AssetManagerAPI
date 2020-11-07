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
    private contractor: string;
    private contractorPassword: string;
    private abiPath: string;
    private abi;
    private AssetManagerContract;
    private web3;
    @InjectRepository(User)
    private userRepository: Repository<User>

    private readonly logger = new Logger(AssetsService.name);

    constructor() {
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.contractor = process.env.CONTRACTOR;
        this.contractorPassword = AES.decrypt(process.env.CONTRACTOR_PASS, process.env.KEY).toString(enc.Utf8);
        this.abiPath = process.env.ABI_PATH
        this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        this.web3 = new Web3(process.env.WEB3_URL);
        this.web3.eth.handleRevert = true;
        this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
    }

    async buyAsset(assetTransfer: AssetTransferRequest): Promise<number> {
        const query = "SELECT * FROM user WHERE userId = ?";
        const sellerUser = await this.userRepository.query(query, [assetTransfer.sellerId]);
        if (sellerUser.length !== 1) {
            throw new Error(`Sender with id ${assetTransfer.sellerId} not found`);
        }
        const buyerUser = await this.userRepository.query(query, [assetTransfer.buyerId]);
        if (buyerUser.length !== 1) {
            throw new Error(`Recipient with id ${assetTransfer.buyerId} not found`);
        }

        const tokenId = assetTransfer.tokenId;
        const seller = sellerUser[0].address;
        const buyer = buyerUser[0].address
        const buyerPassword = AES.decrypt(buyerUser[0].password, process.env.KEY).toString(enc.Utf8);
        const quantity = assetTransfer.quantity;
        const price = assetTransfer.price;

        return new Promise(async (resolve, reject) => {
            try {
                await this.web3.eth.personal.unlockAccount(buyer, buyerPassword);
                this.logger.log(`Account ${buyer} unlocked`);
                await this.AssetManagerContract.methods.buyShares(tokenId, seller, quantity, price).send({ from: buyer, gasPrice: '0' });
                resolve(quantity);
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

        return new Promise(async (resolve, reject) => {
            try {
                await this.web3.eth.personal.unlockAccount(this.contractor, this.contractorPassword);
                this.logger.log(`Account ${this.contractor} unlocked`);
                const assetRequest = {
                    name: asset.name,
                    tokenId: asset.tokenId,
                    symbol: asset.symbol,
                    totalQuantity: asset.totalQuantity,
                    price: asset.price,
                    issuer: issuer,
                }

                this.logger.log(assetRequest);
                await this.AssetManagerContract.methods.mint(assetRequest).send({ from: this.contractor, gasPrice: '0' });
                this.logger.log(`Asset ${asset.symbol} minted`);
                const res = await this.AssetManagerContract.methods.sharesContract(asset.tokenId).call({ from: this.contractor, gasPrice: '0' });
                resolve(Asset.assetFromResponse(res));
            } catch (e) {
                reject(e);
            }
        });
    }
}
