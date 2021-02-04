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

    async changeAssetMarket(tokenId: number, market: Market): Promise<Market> {
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
