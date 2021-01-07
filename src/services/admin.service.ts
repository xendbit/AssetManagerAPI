import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { AES } from 'crypto-js';
import { Asset } from 'src/models/asset.model';
import { AdminRequest } from 'src/request.objects/admin.request';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);
    
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    constructor() {}

    async changeApprovalStatus(tokenId: number, status: boolean): Promise<Boolean> {
        this.logger.debug(`status is : ${status}`);
        return new Promise(async (resolve, reject) => {
            try {
                let asset: Asset = await this.assetRepository.createQueryBuilder("asset")
                        .where("tokenId = :tokenId", {tokenId: tokenId})
                        .getOne();

                if(asset === undefined) {
                    reject(`Asset with token-id ${tokenId} not found`);
                } else {
                    this.logger.debug(asset);
                    const numStatus = status;
                    if(asset.approved !== numStatus) {
                        asset.approved = numStatus;
                        asset = await this.assetRepository.save(asset);
                    }

                    resolve(status);
                }
            } catch(error) {
                reject(error);
            }        
        });        
    }
}
