import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Asset } from 'src/models/asset.model';
import { Market, OrderType } from 'src/models/enums';
import { Order } from 'src/models/order.model';
import { User } from 'src/models/user.model';
import { OrderRequest } from 'src/request.objects/order.request';
import { Utils } from 'src/utils';
import { Repository } from 'typeorm';
import { EthereumService } from './ethereum.service';

@Injectable()
export class OrdersService {

    @InjectRepository(Order)
    private orderRepository: Repository<Order>
    @InjectRepository(User)
    private userRepository: Repository<User>
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    private readonly logger = new Logger(OrdersService.name);

    constructor(
        private ethereumService: EthereumService,
    ) {
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
                    this.orderRepository.save(blockOrder);
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

    async postOrder(or: OrderRequest, isIssue: boolean): Promise<Order> {
        return new Promise(async (resolve, reject) => {
            try {
                const poster = await this.userRepository.findOne(or.userId);

                if (or.market === Market.PRIMARY && !isIssue) {
                    const dbOrder: Order = await this.orderRepository.createQueryBuilder("asset")
                    .where("tokenId = :tid", { tid: or.tokenId })
                    .andWhere("issuerIsSeller = true")
                    .getOne();

                    if (dbOrder === undefined) {
                        reject("Primary Market Issue Order not found");
                    } else {
                        await this.ethereumService.buy(dbOrder.key, Market.PRIMARY, poster);
                        const updatedOrder = await this.ethereumService.getOrder(dbOrder.key);
                        updatedOrder.id = dbOrder.id;
                        this.orderRepository.save(updatedOrder);
                        resolve(dbOrder);
                    }
                }

                if(or.orderId !== undefined) {
                    const dbOrder: Order = await this.orderRepository.findOne(or.orderId);
                    if(dbOrder === undefined) {
                        reject(`Order with id ${or.orderId} not found`);
                    } else {
                        await this.ethereumService.buy(dbOrder.key, Market.PRIMARY, poster);
                        const updatedOrder = await this.ethereumService.getOrder(dbOrder.key);
                        updatedOrder.id = dbOrder.id;
                        this.orderRepository.save(updatedOrder);
                        resolve(dbOrder);
                    }
                }

                const key = Utils.getKey(or);
                or.key = key;                
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
                } else if (OrderType[or.orderType] === 'SELL') {
                    const balance = await this.ethereumService.getOwnedShares(or.tokenId, posterAddress.address);
                    if (balance < or.amount) {
                        reject(`You don't have enough tokens for this transaction.`);
                    }
                }

                await this.ethereumService.postOrder(or, poster);
                let order = await this.ethereumService.getOrder(key);
                if (or.orderType === OrderType.SELL) {
                    order.issuerIsSeller = isIssue;
                } else {
                    order.issuerIsSeller = false;
                }
                order = await this.orderRepository.save(order);

                // check if the user has this asset, if not post it
                let asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("owner = :owner", { owner: posterAddress.address })
                    .andWhere("tokenId = :ti", { ti: or.tokenId })
                    .getOne();

                if (asset === undefined) {
                    asset = (await this.assetRepository.createQueryBuilder("asset")
                        .andWhere("tokenId = :ti", { ti: or.tokenId })
                        .getMany())[0];

                    const newAsset: Asset = { ...asset };
                    newAsset.owner = posterAddress.address;
                    newAsset.id = undefined;
                    await this.assetRepository.save(newAsset);
                }

                resolve(order);
            } catch (error) {
                reject(error);
            }
        });
    }

}
