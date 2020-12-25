import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AES } from 'crypto-js';
import { PasswordReset } from 'src/models/password.reset.model';
import { FundWalletRequest } from 'src/request.objects/fund.wallet.request';
import { LoginRequest } from 'src/request.objects/login.request';
import { PasswordResetRequest } from 'src/request.objects/password.reset.request';
import { UserRequest } from 'src/request.objects/user.request';
import { Utils } from 'src/utils';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { EmailService } from './email.service';
import { Address, EthereumService } from './ethereum.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    @InjectRepository(User)
    private userRepository: Repository<User>

    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>

    constructor(private ethereumService: EthereumService, private emailService: EmailService) { }

    async changePassword(pro: PasswordResetRequest): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                let dbUser = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { email: pro.email })
                    .getOne();
                if (dbUser === undefined) {
                    reject(`User with email address ${pro.email} not found`);
                } else {
                    let pr = await this.passwordResetRepository.createQueryBuilder("passwordReset")
                        .where("userId = :userId", { userId: dbUser.id })
                        .andWhere("expiry > :expiry", { expiry: new Date().getTime() })
                        .andWhere("token = :token", { token: pro.token })
                        .getOne();

                    if (pr === undefined) {
                        reject(`Token not found or expired`);
                    } else {
                        const salt = genSaltSync(12, 'a');
                        const passwordHashed = hashSync(pro.newPassword, salt);
                        dbUser.password = passwordHashed;
                        dbUser = await this.userRepository.save(dbUser);

                        pr.expiry = new Date().getTime();
                        pr = await this.passwordResetRepository.save(pr);

                        resolve(`Password succesfully changed`);
                    }
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async requestPasswordToken(pro: PasswordResetRequest): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { email: pro.email })
                    .getOne();
                if (dbUser === undefined) {
                    reject(`User with email address ${pro.email} not found`);
                } else {
                    let pr = await this.passwordResetRepository.createQueryBuilder("passwordReset")
                        .where("userId = :userId", { userId: dbUser.id })
                        .andWhere("expiry > :expiry", { expiry: new Date().getTime() })
                        .getOne();

                    let token = 0;
                    if (pr === undefined) {
                        token = Utils.getRndInteger(1, process.env.MAX_TOKEN_ID);
                        const thirtyMinutes = new Date().getTime() + (+process.env.RESET_TOKEN_EXPIRY * 60 * 1000);
                        pr = {
                            expiry: thirtyMinutes,
                            token: token,
                            userId: dbUser.id,
                        }
                        pr = await this.passwordResetRepository.save(pr);
                    } else {
                        token = pr.token;
                    }

                    await this.emailService.sendPasswordResetToken(token + "", pro.email);

                    resolve("Password Reset Token sent successfully");
                }
            } catch (error) {
                reject(error);
            }
        });

    }

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
