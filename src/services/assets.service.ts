import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { Injectable, Logger } from '@nestjs/common';
import { Utils } from 'src/utils';
import { Order } from 'src/models/order.model';
import { TokenShares } from 'src/models/token.shares';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { EthereumService } from './ethereum.service';
import { Market, OrderStrategy, OrderType } from 'src/models/enums';
import { OrderRequest } from 'src/request.objects/order.request';
import { AssetRequest } from 'src/request.objects/asset-request';
import { Asset } from 'src/models/asset.model';
import { ImageService } from './image.service';
import { OrdersService } from './orders.service';
import { UserAssets } from 'src/models/user.assets.model';
import { NSEAssetRequest } from 'src/request.objects/nse.asset.request';

@Injectable()
export class AssetsService {
    @InjectRepository(User)
    private userRepository: Repository<User>

    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    private readonly logger = new Logger(AssetsService.name);

    constructor(
        private ethereumService: EthereumService,
        private imageService: ImageService,
        private ordersService: OrdersService
    ) {
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

        const qb = this.assetRepository.createQueryBuilder("asset")
            .leftJoin(UserAssets, "userAssets", "asset.id = userAssets.asset_id")
            .where("userAssets.user_id = :uid", { uid: ownerUser.id });

        return paginate<Asset>(qb, options);
    }

    async listAssets(options: IPaginationOptions): Promise<Pagination<Asset>> {
        const qb = this.assetRepository.createQueryBuilder("asset").groupBy("tokenId");
        return paginate<Asset>(qb, options);
    }

    async createNseAsset(ar: NSEAssetRequest): Promise<NSEAssetRequest> {
        return new Promise(async (resolve, reject) => {
            try {
                const issuerUser: User = await this.userRepository.createQueryBuilder("user").where("email = :email", { email: ar.issuerEmail }).getOne();
                if (issuerUser === undefined) {
                    throw new Error(`Issuer with email ${ar.issuerEmail} not found`);
                }

                const issuerAddress = await this.ethereumService.getAddressFromEncryptedPK(issuerUser.passphrase);

                const asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("symbol = :symbol", { symbol: ar.artSymbol })
                    .andWhere("issuer = :issuer", { issuer: issuerAddress.address })
                    .getOne();

                if (asset !== undefined) {
                    reject('Asset with name and issuer already exists');
                } else {
                    const tokenId = ar.artId;
                    const assetRequest: AssetRequest = {
                        artistName: ar.artistName,
                        tokenId: tokenId,
                        brokerId: '0',
                        commission: 0,
                        createdOn: 0,
                        description: ar.artDescription,
                        image: ar.artPicture,
                        issuer: issuerAddress.address,
                        issuerId: issuerUser.id,
                        issuingPrice: ar.pricePerToken,
                        nameOfOwners: "",
                        price: ar.pricePerToken,
                        sharesAvailable: ar.numberOfTokensForSale,
                        symbol: ar.artSymbol,
                        titleOfWork: ar.artTitle,
                        totalSupply: ar.numberOfTokens,
                        listImmediately: false,
                        creationYear: ar.artCreationYear,
                        value: ar.artValue
                    }
                    const result = await this.ethereumService.issueToken(assetRequest);
                    const tokenShares: TokenShares = await this.ethereumService.getTokenShares(tokenId);
                    const asset: Asset = {
                        tokenId: tokenId,
                        issuer: issuerAddress.address,
                        imageUrl: '',
                        approved: 0,
                        owner: tokenShares.owner,
                        sharesContract: tokenShares.sharesContract,
                        market: Market.PRIMARY,
                        marketPrice: assetRequest.issuingPrice,
                        ...assetRequest
                    };

                    this.logger.debug(`Asset ${assetRequest.symbol} minted by transaction ${result}`);
                    asset.image = ""; // clear out the image
                    //transferTokenOwnership
                    const dbAsset = await this.assetRepository.save(asset);
                    resolve(ar);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async issueAsset(ar: AssetRequest): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const issuerUser: User = await this.userRepository.findOne(ar.issuerId);
                if (issuerUser === undefined) {
                    throw new Error(`Issuer with id ${ar.issuerId} not found`);
                }

                if (ar.sharesAvailable > ar.totalSupply) {
                    reject("Available shares can not be greater than total supply");
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
                    const imageUrl: string = await this.imageService.uploadAssetImage(ar.image);
                    ar.image = imageUrl;
                    const result = await this.ethereumService.issueToken(ar);
                    const tokenShares: TokenShares = await this.ethereumService.getTokenShares(tokenId);
                    if (ar.brokerId === undefined) {
                        ar.brokerId = "0";
                    }
                    const asset: Asset = {
                        tokenId: tokenId,
                        issuer: issuerAddress.address,
                        imageUrl: imageUrl,
                        approved: 0,
                        owner: tokenShares.owner,
                        sharesContract: tokenShares.sharesContract,
                        market: Market.PRIMARY,
                        marketPrice: ar.issuingPrice,
                        ...ar
                    };

                    this.logger.debug(`Asset ${ar.symbol} minted by transaction ${result}`);
                    asset.image = ""; // clear out the image
                    //transferTokenOwnership
                    const dbAsset = await this.assetRepository.save(asset);
                    resolve(dbAsset)

                    if (ar.listImmediately !== undefined && ar.listImmediately === true) {
                        this.changeApprovalStatus(tokenId, true).then(changed => {
                            this.logger.debug("Asset Status Changed");
                        });
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async changeApprovalStatus(tokenId: number, status: boolean): Promise<boolean> {
        status = JSON.parse(status + "");
        return new Promise(async (resolve, reject) => {
            try {
                let asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :tokenId", { tokenId: tokenId })
                    .getOne();

                if (asset === undefined) {
                    reject(`Asset with token-id ${tokenId} not found`);
                } else {
                    this.logger.debug(asset);
                    const numStatus = status ? 1 : 0;
                    if (asset.approved !== numStatus) {
                        asset.approved = numStatus;
                        if (status) {
                            this.logger.debug('Putting Order Up for Sale');
                            // Issue Sell Order for shares available from issuer                            
                            const issuer: number = asset.issuerId;
                            const or: OrderRequest = {
                                amount: asset.sharesAvailable,
                                goodUntil: 0,
                                orderStrategy: OrderStrategy.GOOD_TILL_CANCEL,
                                orderType: OrderType.SELL,
                                price: asset.issuingPrice,
                                tokenId: tokenId,
                                userId: issuer,
                                market: Market.PRIMARY
                            }

                            asset = await this.assetRepository.save(asset);
                            await this.ordersService.postOrder(or, true);
                        } else {
                            asset.approved = 0;
                            asset.market = Market.DECLINED;
                            asset = await this.assetRepository.save(asset);
                        }
                    }

                    resolve(status);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
