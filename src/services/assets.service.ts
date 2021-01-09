import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { Injectable, Logger } from '@nestjs/common';
import { Utils } from 'src/utils';
import { Order } from 'src/models/order.model';
import { TokenShares } from 'src/models/token.shares';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { EthereumService } from './ethereum.service';
import { Market, OrderType } from 'src/models/enums';
import { OrderRequest } from 'src/request.objects/order.request';
import { AssetRequest } from 'src/request.objects/asset-request';
import { Asset } from 'src/models/asset.model';
import { ImageService } from './image.service';

@Injectable()
export class AssetsService {
    @InjectRepository(User)
    private userRepository: Repository<User>

    @InjectRepository(Order)
    private orderRepository: Repository<Order>

    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    private readonly logger = new Logger(AssetsService.name);

    constructor(
        private ethereumService: EthereumService,
        private imageService: ImageService,        
    ) {
    }

    async findOrderById(id: number): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const order: Order = await this.orderRepository.findOne(id);
                if (order === undefined) {
                    throw Error("Order with ID not found");
                } else {
                    let blockOrder = await this.ethereumService.getOrder(order.key);
                    resolve(blockOrder);
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    async listOrders(options: IPaginationOptions): Promise<Pagination<Order>> {
        return paginate<Order>(this.orderRepository, options);
    }

    async listOrdersByTokenId(options: IPaginationOptions, tokenId: number): Promise<Pagination<Order>> {
        const qb = this.orderRepository.createQueryBuilder("order").where("tokenId = :tokenId", { tokenId: tokenId });
        return paginate<Order>(qb, options);
    }

    async listOrdersByBuyer(options: IPaginationOptions, buyerId: number): Promise<Pagination<Order>> {
        const buyer: User = await this.userRepository.findOne(buyerId);
        if (buyer === undefined) {
            throw Error("Buyer not found");
        }

        const buyerAddress = await this.ethereumService.getAddressFromEncryptedPK(buyer.passphrase);
        const qb = this.orderRepository.createQueryBuilder("order")
            .where("buyer = :buyer", { buyer: buyerAddress.address });
        return paginate<Order>(qb, options);
    }

    async listOrdersBySeller(options: IPaginationOptions, sellerId: number): Promise<Pagination<Order>> {
        const seller: User = await this.userRepository.findOne(sellerId);
        if (seller === undefined) {
            throw Error("Seller not found");
        }

        const sellerAddress = await this.ethereumService.getAddressFromEncryptedPK(seller.passphrase);
        const qb = this.orderRepository.createQueryBuilder("order")
            .where("seller = :seller", { seller: sellerAddress.address });
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

                const posterAddress = this.ethereumService.getAddressFromEncryptedPK(poster.passphrase);
                this.logger.debug(OrderType[or.orderType]);
                if (OrderType[or.orderType] === 'BUY') {
                    const balance = await this.ethereumService.getWalletBalance(posterAddress.address);
                    const needed = or.amount * or.price;
                    if (balance < needed) {
                        reject(`Wallet balance is too low for this transaction.`);
                    }
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

    async findAssetByTokenId(tokenId: number): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :ti", { "ti": tokenId })
                    .getOne();
                if (asset === undefined) {
                    throw Error("Asset not found");
                } else {
                    resolve(asset);
                }
            } catch (error) {
                reject(error);
            }
        })
    }

    async listAssetsByIssuer(options: IPaginationOptions, issuerId: number): Promise<Pagination<Asset>> {
        const issuerUser: User = await this.userRepository.findOne(issuerId);
        if (issuerUser === undefined) {
            throw Error("Issuer not found");
        }

        const issuerAddress = await this.ethereumService.getAddressFromEncryptedPK(issuerUser.passphrase);

        const qb = this.assetRepository.createQueryBuilder("asset")
            .where("issuer = :issuer", { issuer: issuerAddress.address });

        return paginate<Asset>(qb, options);
    }

    async listAssetsByOwner(options: IPaginationOptions, ownerId: number): Promise<Pagination<Asset>> {
        const ownerUser: User = await this.userRepository.findOne(ownerId);
        if (ownerUser === undefined) {
            throw Error("Owner not found");
        }

        const ownerAddress = await this.ethereumService.getAddressFromEncryptedPK(ownerUser.passphrase);

        const qb = this.assetRepository.createQueryBuilder("asset")
            .where("owner = :owner", { owner: ownerAddress.address });

        return paginate<Asset>(qb, options);
    }

    async listAssets(options: IPaginationOptions): Promise<Pagination<Asset>> {
        return paginate<Asset>(this.assetRepository, options);
    }

    async issueAsset(ar: AssetRequest): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const issuerUser: User = await this.userRepository.findOne(ar.issuerId);
                if (issuerUser === undefined) {
                    throw new Error(`Issuer with id ${ar.issuerId} not found`);
                }

                const issuerAddress = await this.ethereumService.getAddressFromEncryptedPK(issuerUser.passphrase);

                const asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("symbol = :symbol", { symbol: ar.symbol })
                    .andWhere("issuer = :issuer", { issuer: issuerAddress.address })
                    .getOne();

                if (asset !== undefined) {
                    reject('Asset with name and issuer already exists');
                } else {
                    const tokenId = Utils.getRndInteger(1, process.env.MAX_TOKEN_ID);
                    ar.tokenId = tokenId;
                    ar.issuer = issuerAddress.address;
                    const result = await this.ethereumService.issueToken(ar, true);
                    let tokenShares: TokenShares = await this.ethereumService.getTokenShares(tokenId);
                    const imageUrl: string = await this.imageService.uploadAssetImage(ar.image);
                    const asset: Asset = {                         
                        tokenId: tokenId, 
                        issuer: issuerAddress.address,
                        imageUrl: imageUrl,
                        approved: false,
                        owner: tokenShares.owner,
                        sharesContract: tokenShares.sharesContract,                        
                        market: Market.PRIMARY,
                        ...ar
                    };

                    this.logger.debug(`Asset ${ar.symbol} minted by transaction ${result}`);
                    asset.image = ""; // clear out the image
                    //transferTokenOwnership
                    const dbAsset = await this.assetRepository.save(asset);                    
                    resolve(dbAsset)
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
