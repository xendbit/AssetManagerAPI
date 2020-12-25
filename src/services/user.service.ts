import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AES, enc } from 'crypto-js';
import { FundWalletRequest } from 'src/request.objects/fund.wallet.request';
import { LoginRequest } from 'src/request.objects/login.request';
import { UserRequest } from 'src/request.objects/user.request';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { Address, EthereumService } from './ethereum.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    
    @InjectRepository(User)
    private userRepository: Repository<User>

    constructor(private ethereumService: EthereumService) {}

    async ownedShares(tokenId: number, userId: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(userId)
                if (dbUser !== undefined) {
                    const address: Address = await this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                    const balance: number = await this.ethereumService.getOwnedShares(tokenId, address.address);
                    resolve(balance);
                } else {
                    throw Error('User with ID not found');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getWalletBalance(userId: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(userId);
                if (dbUser !== undefined) {
                    const address: Address = await this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                    const balance: number = await this.ethereumService.getWalletBalance(address.address);
                    resolve(balance);
                } else {
                    reject('User with ID not found');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async fundWallet(fwr: FundWalletRequest): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(fwr.userId);
                if (dbUser === undefined) {
                    throw Error('User with ID not found');
                }

                const address = this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                const result = await this.ethereumService.fundWallet(address.address, fwr.amount);                
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    async login(uro: LoginRequest): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = genSaltSync(12, 'a');
                let dbUser: User = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { "email": uro.email })
                    .getOne();

                if (dbUser !== undefined) {
                    if (compareSync(uro.password, dbUser.password)) {
                        resolve(dbUser);
                    } else {
                        throw Error("Login Failed: password")
                    }
                } else {
                    throw new Error("Login Failed. email address");
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getNewAddress(uro: UserRequest): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = genSaltSync(12, 'a');
                const passwordHashed = hashSync(uro.password, salt);
                const passphraseHashed = AES.encrypt(uro.passphrase, process.env.KEY).toString();

                let dbUser: User = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { "email": uro.email })
                    .getOne();

                if (dbUser !== undefined) {
                    throw Error("User with email address already exists");
                }

                const user: User = {
                    password: passwordHashed,
                    passphrase: passphraseHashed,
                    email: uro.email
                }

                dbUser = await this.userRepository.save(user);
                resolve(dbUser);
            } catch (error) {
                reject(error);
            }
        });
    }
}
