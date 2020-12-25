import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { AES } from 'crypto-js';
import { stat } from 'fs';
import { Admin } from 'src/models/admin.model';
import { TokenShares } from 'src/models/token.shares.model';
import { AdminRequest } from 'src/request.objects/admin.request';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);
    
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>
    @InjectRepository(TokenShares)
    private tokenSharesRepository: Repository<TokenShares>

    constructor() {}

    async changeApprovalStatus(tokenId: number, status: boolean): Promise<Boolean> {
        this.logger.debug(`status is : ${status}`);
        return new Promise(async (resolve, reject) => {
            try {
                const ts: TokenShares = await this.tokenSharesRepository.createQueryBuilder("tokenShares")
                        .where("tokenId = :tokenId", {tokenId: tokenId})
                        .getOne();

                if(ts === undefined) {
                    reject(`Token with id ${tokenId} not found`);
                } else {
                    this.logger.debug(ts);
                    const numStatus = status ? 1 : 0;
                    if(ts.approved !== numStatus) {
                        ts.approved = numStatus;
                        this.tokenSharesRepository.save(ts);
                    }

                    resolve(status);
                }
            } catch(error) {
                reject(error);
            }        
        });        
    }

    async newAdmin(aro: AdminRequest): Promise<Admin> {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = genSaltSync(12, 'a');
                const passwordHashed = hashSync(aro.password, salt);
                const passphraseHashed = AES.encrypt(aro.passphrase, process.env.KEY).toString();

                let dbAdmin: Admin = await this.adminRepository.createQueryBuilder("admin")
                    .where("email = :email", { "email": aro.email })
                    .getOne();

                if (dbAdmin !== undefined) {
                    throw Error("Admin with email address already exists");
                }

                const admin: Admin = {
                    password: passwordHashed,
                    passphrase: passphraseHashed,
                    email: aro.email,
                    firstName: aro.firstName,
                    lastName: aro.lastName
                }

                dbAdmin = await this.adminRepository.save(admin);
                resolve(dbAdmin);
            } catch(error) {
                reject(error);
            }        
        });
    }
}
