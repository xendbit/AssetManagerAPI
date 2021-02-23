import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Fees } from 'src/models/fees.model';
import { Repository } from 'typeorm';

@Injectable()
export class FeesService {
    @InjectRepository(Fees)
    feesReposittory: Repository<Fees>;

    constructor() { }

    async setFees(fees: Fees): Promise<Fees> {
        let dbFees: Fees = await this.feesReposittory.createQueryBuilder("fees").getOne();
        if (dbFees === undefined) {
            dbFees = await this.feesReposittory.save(fees);
        } else {
            dbFees.blockchain = fees.blockchain;
            dbFees.nse = fees.nse;
            dbFees.smsNotification = fees.smsNotification;
            dbFees.transaction = fees.transaction;
            await this.feesReposittory.save(dbFees);
        }

        return dbFees;
    }

    async getFees(): Promise<Fees> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbFees: Fees = await this.feesReposittory.createQueryBuilder("fees").getOne();
                if (dbFees === undefined) {
                    reject("Fees not found");
                }
                resolve(dbFees);
            } catch (error) {
                reject(error);
            }
        })
    }
}

