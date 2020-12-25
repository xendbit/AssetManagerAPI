import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSaltSync, hashSync } from 'bcrypt';
import { AES } from 'crypto-js';
import { Admin } from 'src/models/admin.model';
import { AdminRequest } from 'src/request.objects/admin.request';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService {
    private readonly logger = new Logger(AdminService.name);
    
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>

    constructor() {}

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
