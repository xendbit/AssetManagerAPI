import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Asset } from 'src/models/asset.model';
import { Market, OrderStatus, OrderStrategy, OrderType } from 'src/models/enums';
import { Order } from 'src/models/order.model';
import { UserAssets } from 'src/models/user.assets.model';
import { User } from 'src/models/user.model';
import { OrderRequest } from 'src/request.objects/order.request';
import { Utils } from 'src/utils';
import { Repository } from 'typeorm';
import { Address, EthereumService } from './ethereum.service';
import { SmsService } from './sms.service';
import { MarketSettingsService } from './market-settings.service';
import { TradeRequest } from 'src/request.objects/trade.request';
import { Trade } from 'src/models/trade.model';

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
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>

    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private ethereumService: EthereumService,
        private smsService: SmsService,
        private marketService: MarketSettingsService
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
                    order.amountRemaining = 0;
                    this.orderRepository.save(order);
                    resolve(order);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async trade(tro: TradeRequest): Promise<TradeRequest> {
        return new Promise(async (resolve, reject) => {
            try {
                const buyer: User = await this.userRepository.createQueryBuilder("user").where("email = :email", { email: tro.buyerEmail }).getOne();
                const seller: User = await this.userRepository.createQueryBuilder("user").where("email = :email", { email: tro.sellerEmail }).getOne();

                const asset = await this.assetRepository.createQueryBuilder("asset").where("symbol = :sym", {sym: tro.assetSymbol}).getOne();

                const buyerAddress = this.ethereumService.getAddressFromEncryptedPK(buyer.passphrase);

                if (buyer === undefined) {
                    reject(`Buyer with email ${tro.buyerEmail} not found`);
                }

                if (seller === undefined) {
                    reject(`Seller with email ${tro.sellerEmail} not found`);
                }

                const totalBought = tro.numberOfTradeTokens;

                await this.ethereumService.transferShares(seller, asset.tokenId, buyerAddress.address, totalBought);
                
                let trade: Trade = { ...tro };
                trade = await this.tradeRepository.save(trade);
                                
                resolve(tro);
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

    async processOrder(buyOrder: Order, sellOrder: Order): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {

                const buyerAmount = buyOrder.amountRemaining;
                const sellerAmount = sellOrder.amountRemaining;

                const now = (new Date()).getTime();

                const toReturn = {
                    matched: false,
                    buyExpired: false,
                    sellExpired: false,
                    toBuy: 0,
                    toSell: 0,
                    buyOrder: buyOrder,
                    sellOrder: sellOrder
                };


                if (buyOrder.goodUntil > 0 && buyOrder.goodUntil < now) {
                    toReturn.buyExpired = true;
                }

                if (sellOrder.goodUntil > 0 && sellOrder.goodUntil < now) {
                    toReturn.sellExpired = true;
                }

                if (buyOrder.price >= sellOrder.price && (toReturn.buyExpired === false && toReturn.sellExpired === false)) {
                    if (buyerAmount === sellerAmount) {
                        resolve(await this.processOrderSameAmount(toReturn, buyOrder, sellOrder));
                    } else if (buyerAmount > sellerAmount && buyOrder.orderStrategy !== OrderStrategy.ALL_OR_NOTHING) {
                        resolve(await this.processOrderBuyPartial(toReturn, buyOrder, sellOrder));
                    } else if (buyerAmount < sellerAmount && sellOrder.orderStrategy !== OrderStrategy.ALL_OR_NOTHING) {
                        resolve(await this.processOrderSellPartial(toReturn, buyOrder, sellOrder));
                    }
                } else if (sellOrder.orderStrategy === OrderStrategy.MARKET_ORDER && toReturn.sellExpired == false) {
                    if (buyerAmount === sellerAmount) {
                        resolve(await this.processOrderSameAmount(toReturn, buyOrder, sellOrder));
                    } else if (buyerAmount > sellerAmount && buyOrder.orderStrategy !== OrderStrategy.ALL_OR_NOTHING) {
                        resolve(await this.processOrderBuyPartial(toReturn, buyOrder, sellOrder));
                    } else if (buyerAmount < sellerAmount) {
                        resolve(await this.processOrderSellPartial(toReturn, buyOrder, sellOrder));
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async processOrderBuyPartial(toReturn: any, buyOrder: Order, sellOrder: Order): Promise<any> {
        this.logger.debug("Processing Order Buy Partial");
        toReturn.toBuy = buyOrder.amountRemaining;
        toReturn.toSell = sellOrder.amountRemaining;
        buyOrder.amountRemaining = buyOrder.amountRemaining - sellOrder.amountRemaining;
        sellOrder.amountRemaining = 0;
        sellOrder.status = OrderStatus.MATCHED;
        const bo = await this.orderRepository.save(buyOrder);
        const so = await this.orderRepository.save(sellOrder);
        toReturn.buyOrder = bo;
        toReturn.sellOrder = so;

        //this.ethereumService.matchOrder(buyOrder.key, sellOrder.key, sellOrder.amountRemaining);
        return toReturn;
    }

    async processOrderSellPartial(toReturn: any, buyOrder: Order, sellOrder: Order): Promise<any> {
        this.logger.debug("Processing Order Sell Partial");
        toReturn.toBuy = buyOrder.amountRemaining;
        toReturn.toSell = sellOrder.amountRemaining;
        sellOrder.amountRemaining = sellOrder.amountRemaining - buyOrder.amountRemaining;
        buyOrder.amountRemaining = 0
        buyOrder.status = OrderStatus.MATCHED;
        const bo = await this.orderRepository.save(buyOrder);
        const so = await this.orderRepository.save(sellOrder);
        toReturn.buyOrder = bo;
        toReturn.sellOrder = so;

        //this.ethereumService.matchOrder(buyOrder.key, sellOrder.key, buyOrder.amountRemaining);
        return toReturn;
    }

    async processOrderSameAmount(toReturn: any, buyOrder: Order, sellOrder: Order): Promise<any> {
        this.logger.debug("Processing Order Same Amount");
        toReturn.toBuy = buyOrder.amountRemaining;
        toReturn.toSell = sellOrder.amountRemaining;
        toReturn.matched = true;
        sellOrder.amountRemaining = 0;
        buyOrder.amountRemaining = 0;
        sellOrder.status = OrderStatus.MATCHED;
        buyOrder.status = OrderStatus.MATCHED;
        const bo = await this.orderRepository.save(buyOrder);
        const so = await this.orderRepository.save(sellOrder);
        toReturn.buyOrder = bo;
        toReturn.sellOrder = so;

        //this.ethereumService.matchOrder(buyOrder.key, sellOrder.key, buyOrder.amountRemaining);
        return toReturn;
    }

    async matchOrder(mOrder: Order): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            try {
                let or = await this.orderRepository.findOne(mOrder.id);
                // get 1K orders
                const orderList = await this.orderRepository.createQueryBuilder("order")
                    .where("status = :status", { status: OrderStatus.NEW })
                    .andWhere("tokenId = :ti", {ti: or.tokenId})
                    .andWhere("id != :id", {id: or.id})
                    .getMany();
                let matched = false;
                for (let order of orderList) {
                    this.logger.debug(order);
                    this.logger.debug(`isMatched: ${matched}`);
                    this.logger.debug(`amountRemaining: ${or.amountRemaining}`);

                    if (matched) {
                        break;
                    }

                    if (or.amountRemaining === 0) {
                        break;
                    }

                    const tokenIdEquals = or.tokenId === order.tokenId;
                    const isSameType = or.orderType === order.orderType;
                    let buyerIsSeller = false;
                    const address0 = "0x0000000000000000000000000000000000000000";
                    if (or.seller !== address0 && order.buyer !== address0) {
                        buyerIsSeller = or.seller === order.buyer;
                    } else if (or.buyer != address0 && order.seller != address0) {
                        buyerIsSeller = or.buyer === order.seller;
                    }

                    const sameMarketType = or.orderStrategy === order.orderStrategy;

                    const shouldProcess = tokenIdEquals &&
                        or.status === OrderStatus.NEW &&
                        order.status === OrderStatus.NEW &&
                        !isSameType &&
                        sameMarketType &&
                        !buyerIsSeller;

                    this.logger.debug(`tokenIdEquals: ${tokenIdEquals}, isNew: ${or.status === OrderStatus.NEW}, isSameType: ${isSameType}, sameMarketType: ${sameMarketType}, buyerIsSeller: ${buyerIsSeller}, shouldProcess: ${shouldProcess}`);

                    if (shouldProcess) {
                        var buyOrder: Order;
                        var sellOrder: Order;

                        if (or.orderType === OrderType.BUY) {
                            buyOrder = or;
                            sellOrder = order;
                            const toReturn = await this.processOrder(buyOrder, sellOrder);
                            matched = toReturn.matched;
                            or = await this.orderRepository.findOne(or.id);
                        } else if (or.orderType === OrderType.SELL) {
                            sellOrder = or;
                            buyOrder = order;
                            const toReturn = await this.processOrder(buyOrder, sellOrder);
                            matched = toReturn.matched;
                            or = await this.orderRepository.findOne(or.id);
                        }
                    }
                }

                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }

    async postOrder(or: OrderRequest, isIssue: boolean): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const key = Utils.getKey(or);
                or.key = key;
                //or.orderId = undefined;

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

                    this.smsService.sendSMS(poster.phoneNumber, `Order for ${or.amount} Placed for asset ${or.tokenId}`);

                    this.logger.debug('Running Order Matching');
                    this.matchOrder(order);

                    resolve(order);
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
        const priceMoverPerc = (await this.marketService.getMarketSettings()).percPriceChangeLimit;

        this.logger.debug('Price Mover Perc: ' + priceMoverPerc);

        const fivePercentile = (+priceMoverPerc / 100) * asset.sharesAvailable;

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
