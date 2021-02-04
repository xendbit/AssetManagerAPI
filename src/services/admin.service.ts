import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/models/asset.model';
import { Market, OrderStrategy, OrderType } from 'src/models/enums';
import { OrderRequest } from 'src/request.objects/order.request';
import { Repository } from 'typeorm';
import { AssetsService } from './assets.service';
import { EthereumService } from './ethereum.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    constructor(
        private ethereumService: EthereumService,
    ) { }

    async concludePrimarySales(tokenId: number): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :ti", { "ti": tokenId })
                    .getOne();
                if (asset === undefined) {
                    throw Error("Asset not found");
                } 
                await this._changeAssetMarket(tokenId, Market.SECONDARY);
                await this.ethereumService.concludePrimaryMarket(tokenId);
                resolve(asset);
            } catch (error) {
                reject(error);
            }
        });       
    }

    async underSubscribe(tokenId: number): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :ti", { "ti": tokenId })
                    .getOne();
                if (asset === undefined) {
                    throw Error("Asset not found");
                } 
                await this._changeAssetMarket(tokenId, Market.UNDER_SUBSCRIBED);
                await this.ethereumService.underSubscribe(tokenId);
                resolve(asset);
            } catch (error) {
                reject(error);
            }
        });       
    }

    async _changeAssetMarket(tokenId: number, market: Market): Promise<Market> {
        return new Promise(async (resolve, reject) => {
            try {
                let updateResult = await this.assetRepository.createQueryBuilder("asset")
                    .update(Asset)
                    .set({market: market})
                    .where("tokenId = :tokenId", { tokenId: tokenId })
                    .execute();

                resolve(market);
            } catch (error) {
                reject(error);
            }
        });
    }
}
