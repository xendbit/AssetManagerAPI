import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Asset } from 'src/models/asset.model';
import { Market, OrderStrategy, OrderType } from 'src/models/enums';
import { Order } from 'src/models/order.model';
import { UserAssets } from 'src/models/user.assets.model';
import { User } from 'src/models/user.model';
import { OrderRequest } from 'src/request.objects/order.request';
import { Utils } from 'src/utils';
import { Repository } from 'typeorm';
import { Address, EthereumService } from './ethereum.service';
import { SmsService } from './sms.service';

@Injectable()
export class OrdersService {

    @InjectRepository(Order)
    private orderRepository: Repository<Order>
    @InjectRepository(User)
    private userRepository: Repository<User>
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>
    @InjectRepository(UserAssets)
    private userAssetsRepository: Repository<UserAssets>

    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private ethereumService: EthereumService,
        private smsService: SmsService,
    ) {
    }

    async cancelOrder(id: number): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const order: Order = await this.orderRepository.findOne(id);
                if (order === undefined) {
                    throw Error("Order with ID not found");
                } else {
                    order.orderIsCancelled = true;
                    this.orderRepository.save(order);
                    resolve(order);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async findOrderById(id: number): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const order: Order = await this.orderRepository.findOne(id);
                if (order === undefined) {
                    throw Error("Order with ID not found");
                } else {
                    const blockOrder = await this.ethereumService.getOrder(order.key);
                    blockOrder.id = order.id;
                    blockOrder.issuerIsSeller = order.issuerIsSeller;
                    blockOrder.orderIsCancelled = order.orderIsCancelled;
                    this.orderRepository.save(blockOrder);
                    resolve(blockOrder);
                }
            } catch (error) {
                reject(error);
            }
        });
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

    async postOrder(or: OrderRequest, isIssue: boolean): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const key = Utils.getKey(or);
                or.key = key;

                const poster = await this.userRepository.findOne(or.userId);
                const posterAddress = this.ethereumService.getAddressFromEncryptedPK(poster.passphrase);
                const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :ti", { "ti": or.tokenId })
                    .getOne();

                if (or.orderStrategy === OrderStrategy.MARKET_ORDER) {
                    or.price = asset.marketPrice;
                }

                if (or.market === Market.PRIMARY && !isIssue) {
                    const dbOrder: Order = await this.orderRepository.createQueryBuilder("asset")
                        .where("tokenId = :tid", { tid: or.tokenId })
                        .andWhere("issuerIsSeller = true")
                        .getOne();

                    if (dbOrder === undefined) {
                        reject("Primary Market Issue Order not found");
                    } else {
                        await this.ethereumService.buy(or.amount, dbOrder.key, Market.PRIMARY, poster);
                        const updatedOrder = await this.ethereumService.getOrder(dbOrder.key);
                        updatedOrder.id = dbOrder.id;
                        updatedOrder.issuerIsSeller = dbOrder.issuerIsSeller;
                        updatedOrder.orderIsCancelled = dbOrder.orderIsCancelled;
                        this.orderRepository.save(updatedOrder);

                        let buyOrder: Order = {
                            amountRemaining: 0,
                            buyer: posterAddress.address,
                            goodUntil: 0,
                            key: or.key,
                            orderStrategy: 0,
                            orderType: 0,
                            originalAmount: or.amount,
                            price: or.price,
                            seller: asset.issuer,
                            status: 1,
                            tokenId: or.tokenId,
                            issuerIsSeller: false,
                            orderIsCancelled: false,
                        };

                        buyOrder = await this.orderRepository.save(buyOrder);
                        this.saveUserAsset(or.tokenId, poster);
                        this.smsService.sendSMS(poster.phoneNumber, `Order for ${or.amount} Placed for asset ${or.tokenId}`);
                        resolve(buyOrder);
                    }
                } else {

                    if (or.orderId !== undefined) {
                        const dbOrder: Order = await this.orderRepository.findOne(or.orderId);
                        if (dbOrder === undefined) {
                            reject(`Order with id ${or.orderId} not found`);
                        } else {
                            await this.ethereumService.buy(or.amount, dbOrder.key, or.market, poster);
                            const updatedOrder = await this.ethereumService.getOrder(dbOrder.key);
                            updatedOrder.id = dbOrder.id;
                            updatedOrder.issuerIsSeller = dbOrder.issuerIsSeller;
                            updatedOrder.orderIsCancelled = dbOrder.orderIsCancelled;
                            this.orderRepository.save(updatedOrder);

                            this.saveUserAsset(or.tokenId, poster);
                            this.movePrice(updatedOrder);
                            this.smsService.sendSMS(poster.phoneNumber, `Order for ${or.amount} Placed for asset ${or.tokenId}`);

                            resolve(dbOrder);
                        }
                    } else {
                        if (poster === undefined) {
                            reject(`User with id: ${or.userId} not found`);
                        }

                        this.logger.debug(`Order Type: ${OrderType[or.orderType]}`);
                        if (OrderType[or.orderType] === 'BUY') {
                            const balance = await this.ethereumService.getWalletBalance(posterAddress.address);
                            const needed = or.amount * or.price;
                            if (balance < needed) {
                                reject(`Wallet balance is too low for this transaction.`);
                            }
                        } else if (OrderType[or.orderType] === 'SELL') {
                            const balance = await this.ethereumService.getOwnedShares(or.tokenId, posterAddress.address);
                            if (balance < or.amount) {
                                reject(`You don't have enough tokens for this transaction.`);
                            }
                        }

                        if (or.orderStrategy === OrderStrategy.MARKET_ORDER) {
                            or.orderStrategy = OrderStrategy.GOOD_TILL_CANCEL;
                            or.price = asset.marketPrice;
                        }

                        await this.ethereumService.postOrder(or, poster);
                        let order = await this.ethereumService.getOrder(key);
                        if (or.orderType === OrderType.SELL && isIssue) {
                            order.issuerIsSeller = isIssue;
                        } else {
                            order.issuerIsSeller = false;
                        }
                        order = await this.orderRepository.save(order);

                        this.saveUserAsset(or.tokenId, poster);

                        this.movePrice(order);
                        this.smsService.sendSMS(poster.phoneNumber, `Order for ${or.amount} Placed for asset ${or.tokenId}`);

                        resolve(order);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async movePrice(or: Order) {
        // Get Asset
        const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
            .where("tokenId = :ti", { "ti": or.tokenId })
            .getOne();
        const fivePercentile = (+process.env.MARKET_PRICE_MOVER / 100) * asset.sharesAvailable;

        let amountBought = or.originalAmount - or.amountRemaining;
        if (amountBought > fivePercentile) {
            asset.marketPrice = or.price;
            this.assetRepository.save(asset);
        }
    }

    async saveUserAsset(tokenId: number, poster: User) {
        // check if the user has this asset, if not post it
        const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
            .where("tokenId = :ti", { "ti": tokenId })
            .getOne();

        let userAsset: UserAssets = await this.userAssetsRepository.createQueryBuilder("userAssets")
            .where("user_id = :uid", { uid: poster.id })
            .andWhere("token_id = :ti", { ti: tokenId })
            .andWhere("asset_id = :aid", { aid: asset.id })
            .getOne();

        if (userAsset === undefined) {
            userAsset = {
                user_id: poster.id,
                token_id: tokenId,
                asset_id: asset.id
            }

            await this.userAssetsRepository.save(userAsset);
        }
    }
}
