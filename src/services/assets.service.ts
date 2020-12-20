import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { OrderRequest } from 'src/models/request.objects/order.requet';
import { Utils } from 'src/utils';
import { Order } from 'src/models/order.model';
import { AssetRequest } from 'src/models/request.objects/asset-request';
import { TokenShares } from 'src/models/token.shares.model';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { EthereumService } from './ethereum.service';

@Injectable()
export class AssetsService {
    @InjectRepository(User)
    private userRepository: Repository<User>

    @InjectRepository(TokenShares)
    private tokenSharesRepository: Repository<TokenShares>

    @InjectRepository(Order)
    private orderRepository: Repository<Order>

    private readonly logger = new Logger(AssetsService.name);

    constructor(private ethereumService: EthereumService) {
    }

    async findOrderById(id: number): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const order: Order = await this.orderRepository.findOne(id);
                if(order === undefined) {
                    throw Error("Order with buyer not found");
                } else {
                    resolve(order);
                }
            } catch(error) {
                reject(error);
            }
        })
    } 

    async listOrders(options: IPaginationOptions): Promise<Pagination<Order>> {
        return paginate<Order>(this.orderRepository, options);
    }

    async listOrdersByTokenId(options: IPaginationOptions, tokenId: number): Promise<Pagination<Order>> {
        const qb = this.orderRepository.createQueryBuilder("order").where("tokenId = :tokenId", {tokenId: tokenId});
        return paginate<Order>(qb, options);
    }

    async listOrdersByBuyer(options: IPaginationOptions, buyerId: number): Promise<Pagination<Order>> {
        const buyer: User = await this.userRepository.findOne(buyerId);
        if (buyer === undefined) {
            throw Error("Buyer not found");
        }

        const buyerAddress = await this.ethereumService.getAddressFromEncryptedPK(buyer.passphrase);
        const qb = this.orderRepository.createQueryBuilder("order")
                    .where("buyer = :buyer", {buyer: buyerAddress.address});
        return paginate<Order>(qb, options);
    }    
    
    async listOrdersBySeller(options: IPaginationOptions, sellerId: number): Promise<Pagination<Order>> {
        const seller: User = await this.userRepository.findOne(sellerId);
        if (seller === undefined) {
            throw Error("Seller not found");
        }

        const sellerAddress = await this.ethereumService.getAddressFromEncryptedPK(seller.passphrase);
        const qb = this.orderRepository.createQueryBuilder("order")
                    .where("seller = :seller", {seller: sellerAddress.address});
        return paginate<Order>(qb, options);
    } 

    async postOrder(or: OrderRequest): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const key = Utils.getKey(or);
                or.key = key;
                const poster = await this.userRepository.findOne(or.userId);
                if (poster === undefined) {
                    reject(`User with id: ${or.userId} not found`);
                }

                await this.ethereumService.postOrder(or, poster);
                let order = await this.ethereumService.getOrder(key);
                order = await this.orderRepository.save(order);
                resolve(order);
            } catch (error) {
                reject(error);
            }
        });
    }

    async findAssetByTokenId(tokenId: number): Promise<TokenShares> {
        return new Promise(async (resolve, reject) => {
            try {
                const token: TokenShares = await this.tokenSharesRepository.createQueryBuilder("tokenShares")
                                .where("tokenId = :ti", {"ti": tokenId})
                                .getOne();
                if(token === undefined) {
                    throw Error("Token not found");
                } else {
                    resolve(token);
                }
            } catch(error) {
                reject(error);
            }
        })
    }

    async listAssetsByIssuer(options: IPaginationOptions, issuerId: number): Promise<Pagination<TokenShares>> {
        const issuerUser: User = await this.userRepository.findOne(issuerId);
        if (issuerUser === undefined) {
            throw Error("Issuer not found");
        }

        const issuerAddress = await this.ethereumService.getAddressFromEncryptedPK(issuerUser.passphrase);

        this.logger.debug(`Issuer Address: ${issuerAddress.address}`);

        const qb = this.tokenSharesRepository.createQueryBuilder("tokenShares")
                .where("issuer = :issuer", {issuer: issuerAddress.address});
        
        return paginate<TokenShares>(qb, options);
    }

    async listAssets(options: IPaginationOptions): Promise<Pagination<TokenShares>> {
        return paginate<TokenShares>(this.tokenSharesRepository, options);
    }

    async issueAsset(ar: AssetRequest): Promise<TokenShares> {
        return new Promise(async (resolve, reject) => {
            try {
                const issuerUser: User = await this.userRepository.findOne(ar.issuer);
                if (issuerUser === undefined) {
                    throw new Error(`Issuer with id ${ar.issuer} not found`);
                }

                const issuerAddress = await this.ethereumService.getAddressFromEncryptedPK(issuerUser.passphrase);

                const tokenShares = await this.tokenSharesRepository.createQueryBuilder("tokenShares")
                    .where("symbol = :symbol", { symbol: ar.symbol })
                    .andWhere("issuer = :issuer", { issuer: issuerAddress.address })
                    .getOne();

                if (tokenShares !== undefined) {
                    reject('Asset with name and issuer already exists');
                } else {
                    const tokenId = Utils.getRndInteger(1, process.env.MAX_TOKEN_ID);
                    const assetRequest: AssetRequest = {
                        tokenId: tokenId,
                        description: ar.description,
                        symbol: ar.symbol,
                        totalSupply: ar.totalSupply,
                        issuingPrice: ar.issuingPrice,
                        issuer: issuerAddress.address
                    }
                    this.logger.log(assetRequest);
                    const result = await this.ethereumService.issueToken(assetRequest);
                    this.logger.log(`Asset ${ar.symbol} minted by transaction ${result}`);

                    let dbTokenShares = await this.ethereumService.getTokenShares(tokenId);
                    dbTokenShares = await this.tokenSharesRepository.save(dbTokenShares);
                    resolve(dbTokenShares)
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
