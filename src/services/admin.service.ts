import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/models/asset.model';
import { Market, OrderStrategy, OrderType } from 'src/models/enums';
import { OrderRequest } from 'src/request.objects/order.request';
import { Repository } from 'typeorm';
import { AssetsService } from './assets.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    constructor() { }

    // TODO: Change all market types.
    async changeAssetMarket(tokenId: number, market: Market): Promise<Market> {
        return new Promise(async (resolve, reject) => {
            try {
                let asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :tokenId", { tokenId: tokenId })
                    .getOne();

                if (asset === undefined) {
                    reject(`Asset with token-id ${tokenId} not found`);
                } else {
                    asset.market = market;
                    this.assetRepository.save(asset);
                    resolve(market);
                }
            } catch (error) {
                reject(error);
            }
        });
    }
}
