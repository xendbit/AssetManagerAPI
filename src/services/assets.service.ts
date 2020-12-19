import { enc, AES } from 'crypto-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import Web3 from 'web3';
import path = require('path');
import fs = require('fs');
import { OrderRequest } from 'src/models/request.objects/order.requet';
import { Utils } from 'src/utils';
import { Order } from 'src/models/order.model';
import { AssetRequest } from 'src/models/request.objects/asset-request';
import { TokenShares } from 'src/models/token.shares.model';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';

@Injectable()
export class AssetsService {
    // private contractAddress: string;
    // private contractor: string;
    // private contractorPassword: string;
    // private abiPath: string;
    // private abi;
    // private AssetManagerContract;
    // private web3;
    // @InjectRepository(User)
    // private userRepository: Repository<User>

    // @InjectRepository(TokenShares)
    // private tokenSharesRepository: Repository<TokenShares>

    // private readonly logger = new Logger(AssetsService.name);

    // constructor() {
    //     this.contractAddress = process.env.CONTRACT_ADDRESS;
    //     this.contractor = process.env.CONTRACTOR;
    //     this.contractorPassword = AES.decrypt(process.env.CONTRACTOR_PASS, process.env.KEY).toString(enc.Utf8);
    //     this.abiPath = process.env.ABI_PATH
    //     this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
    //     this.web3 = new Web3(process.env.WEB3_URL);
    //     this.web3.eth.handleRevert = true;
    //     this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
    // }

    // async postOrder(or: OrderRequest): Promise<Order> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const key = Utils.getKey(or);
    //             or.key = key;
    //             const poster = await this.userRepository.createQueryBuilder("user")
    //                 .where(`userId = :value`, { value: or.userId })
    //                 .getOne();
    //             if (poster === undefined) {
    //                 reject(`User with id: ${or.userId} not found`);
    //             }

    //             await this.AssetManagerContract.methods.postOrder(or).send({ from: poster.address, gasPrice: '0' });
    //             const blOrder = await this.AssetManagerContract.methods.getOrder(key).call({ from: poster.address });
    //             const order: Order = {
    //                 amountRemaining: blOrder.amountRemaining,
    //                 buyer: blOrder.buyer,
    //                 goodUntil: blOrder.goodUntil,
    //                 key: key,
    //                 orderDate: blOrder.orderDate,
    //                 orderStrategy: blOrder.orderStrategy,
    //                 orderType: blOrder.orderType,
    //                 originalAmount: blOrder.originalAmount,
    //                 price: blOrder.price,
    //                 seller: blOrder.seller,
    //                 status: blOrder.status,
    //                 statusDate: blOrder.statusDate,
    //                 tokenId: blOrder.tokenId,
    //             };
    //             resolve(order);
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    // }

    // async buyAsset(assetTransfer: AssetTransferRequest): Promise<number> {
    //     const query = "SELECT * FROM user WHERE userId = ?";
    //     const sellerUser = await this.userRepository.query(query, [assetTransfer.sellerId]);
    //     if (sellerUser.length !== 1) {
    //         throw new Error(`Sender with id ${assetTransfer.sellerId} not found`);
    //     }
    //     const buyerUser = await this.userRepository.query(query, [assetTransfer.buyerId]);
    //     if (buyerUser.length !== 1) {
    //         throw new Error(`Recipient with id ${assetTransfer.buyerId} not found`);
    //     }

    //     const tokenId = assetTransfer.tokenId;
    //     const seller = sellerUser[0].address;
    //     const buyer = buyerUser[0].address
    //     const buyerPassword = AES.decrypt(buyerUser[0].password, process.env.KEY).toString(enc.Utf8);
    //     const quantity = assetTransfer.quantity;
    //     const price = assetTransfer.price;

    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             await this.web3.eth.personal.unlockAccount(buyer, buyerPassword);
    //             this.logger.log(`Account ${buyer} unlocked`);
    //             await this.AssetManagerContract.methods.buyShares(tokenId, seller, quantity, price).send({ from: buyer, gasPrice: '0' });
    //             resolve(quantity);
    //         } catch (e) {
    //             reject(e);
    //         }
    //     });
    // }

    // async findAssetByTokenId(tokenId: number): Promise<TokenShares> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const token: TokenShares = await this.tokenSharesRepository.createQueryBuilder("tokenShares")
    //                             .where("tokenId = :ti", {"ti": tokenId})
    //                             .getOne();
    //             if(token === undefined) {
    //                 throw Error("Token not found");
    //             } else {
    //                 resolve(token);
    //             }
    //         } catch(error) {
    //             reject(error);
    //         }
    //     })
    // }
    // async listAssetsByIssuer(options: IPaginationOptions, issuerId: number): Promise<Pagination<TokenShares>> {
    //     const issuerUser: User = await this.userRepository.findOne(issuerId);
    //     if (issuerUser === undefined) {
    //         throw Error("Issuer not found");
    //     }

    //     return paginate<TokenShares>(this.tokenSharesRepository, options, {
    //         issuer: issuerUser.address
    //     });
    // }

    // async listAssets(options: IPaginationOptions): Promise<Pagination<TokenShares>> {
    //     return paginate<TokenShares>(this.tokenSharesRepository, options);
    // }

    // async issueAsset(ar: AssetRequest): Promise<TokenShares> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const issuerUser: User = await this.userRepository.findOne(ar.issuerId);
    //             if (issuerUser === undefined) {
    //                 throw new Error(`Issuer with id ${ar.issuerId} not found`);
    //             }
    //             const issuer = issuerUser.address;

    //             await this.web3.eth.personal.unlockAccount(this.contractor, this.contractorPassword);
    //             this.logger.log(`Account ${this.contractor} unlocked`);
    //             const tokenId = Utils.getRndInteger(1, process.env.MAX_TOKEN_ID);
    //             const assetRequest = {
    //                 tokenId: tokenId,
    //                 name: ar.description,
    //                 symbol: ar.symbol,
    //                 totalSupply: ar.totalSupply,
    //                 issuingPrice: ar.issuingPrice,
    //                 issuer: issuer
    //             }
    //             this.logger.log(assetRequest);
    //             await this.AssetManagerContract.methods.mint(assetRequest).send({ from: this.contractor, gasPrice: '0' });
    //             this.logger.log(`Asset ${ar.symbol} minted`);
    //             const res = await this.AssetManagerContract.methods.tokenShares(tokenId).call({ from: this.contractor, gasPrice: '0' });
    //             let dbTokenShares: TokenShares = {
    //                 issuer: res.issuer,
    //                 issuingPrice: res.issuingPrice,
    //                 description: res.name,
    //                 owner: res.owner,
    //                 sharesContract: res.sharesContract,
    //                 symbol: res.symbol,
    //                 tokenId: res.tokenId,
    //                 totalSupply: res.totalSupply
    //             }

    //             dbTokenShares = await this.tokenSharesRepository.save(dbTokenShares);
    //             dbTokenShares.owner = "Nigerian Stock Exchange";
    //             resolve(dbTokenShares)
    //         } catch (error) {
    //             reject(error);
    //         }
    //     });
    // }
}
