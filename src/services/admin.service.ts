import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Asset } from 'src/models/asset.model';
import { OrderStrategy, OrderType } from 'src/models/enums';
import { User } from 'src/models/user.model';
import { OrderRequest } from 'src/request.objects/order.request';
import { Repository } from 'typeorm';
import { AssetsService } from './assets.service';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);

    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    constructor(private assetService: AssetsService) { }

    async changeApprovalStatus(tokenId: number, status: boolean): Promise<Boolean> {
        this.logger.debug(`status is : ${status}`);
        return new Promise(async (resolve, reject) => {
            try {
                let asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                    .where("tokenId = :tokenId", { tokenId: tokenId })
                    .getOne();

                if (asset === undefined) {
                    reject(`Asset with token-id ${tokenId} not found`);
                } else {
                    this.logger.debug(asset);
                    const numStatus = status;
                    if (asset.approved !== numStatus) {
                        asset.approved = numStatus;
                        asset = await this.assetRepository.save(asset);

                        if (status === true) {
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
                            }

                            this.assetService.postOrder(or);
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
