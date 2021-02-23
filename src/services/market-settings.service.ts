import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MarketSettings } from 'src/models/market.settings.model';
import { Repository } from 'typeorm';

@Injectable()
export class MarketSettingsService {
    @InjectRepository(MarketSettings)
    marketSettingsRepository: Repository<MarketSettings>;

    constructor() {}

    async setMarketSettings(ms: MarketSettings): Promise<MarketSettings> {
        let dbMs: MarketSettings = await this.marketSettingsRepository.createQueryBuilder("ms").getOne();
        if (dbMs === undefined) {
            dbMs = await this.marketSettingsRepository.save(ms);
        } else {
            dbMs.percMinBuyQuantity = ms.percMinBuyQuantity;
            dbMs.percPriceChangeLimit = ms.percPriceChangeLimit;
            dbMs.primaryMarketHoldingPeriod = ms.primaryMarketHoldingPeriod;
            dbMs.maxNoOfDaysForInfinityOrders = ms.maxNoOfDaysForInfinityOrders;
            await this.marketSettingsRepository.save(dbMs);
        }

        return dbMs;        
    }

    async getMarketSettings(): Promise<MarketSettings> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbMs: MarketSettings = await this.marketSettingsRepository.createQueryBuilder("ms").getOne();
                if (dbMs === undefined) {
                    reject("Market Settings not found");
                }
                resolve(dbMs);
            } catch (error) {
                reject(error);
            }
        })        
    }
}
