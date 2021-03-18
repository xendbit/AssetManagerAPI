import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AES, enc } from 'crypto-js';
import { IPaginationOptions, paginate, Pagination } from 'nestjs-typeorm-paginate';
import { Role } from 'src/models/enums';
import { PasswordReset } from 'src/models/password.reset.model';
import { LoginRequest } from 'src/request.objects/login.request';
import { PasswordResetRequest } from 'src/request.objects/password.reset.request';
import { UserRequest } from 'src/request.objects/user.request';
import { Utils } from 'src/utils';
import { Repository } from 'typeorm';
import { User } from './../models/user.model';
import { EmailService } from './email.service';
import { Address, EthereumService } from './ethereum.service';
import { ProvidusBankService } from './providus-bank.service';
import { generateMnemonic } from 'bip39';
import { ImageService } from './image.service';
import { NseUserRequest } from 'src/request.objects/nse.user.request';
import { Asset } from 'src/models/asset.model';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    @InjectRepository(User)
    private userRepository: Repository<User>
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>

    @InjectRepository(PasswordReset)
    private passwordResetRepository: Repository<PasswordReset>

    constructor(
        private ethereumService: EthereumService,
        private emailService: EmailService,
        private imageService: ImageService,
    ) {        
    }

    async listUsers(options: IPaginationOptions): Promise<Pagination<User>> {
        return paginate<User>(this.userRepository, options);
    }

    async listUsersByRole(role: number): Promise<User[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const users = await this.userRepository.createQueryBuilder("user")
                    .where("role = :role", { role: role })
                    .getMany();

                resolve(users);
            } catch (error) {
                reject(error);
            }
        });
    }

    async getUserById(id: number): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                resolve(await this.userRepository.findOne(id));
            } catch (error) {
                reject(error);
            }
        });
    }

    async approveUser(id: number): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const user: User = await this.userRepository.findOne(id);
                user.approved = true;
                resolve(this.userRepository.save(user));
            } catch (error) {
                reject(error);
            }
        });
    }

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

    async getUserAssets(email: string): Promise<Asset[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser: User = await this.userRepository.createQueryBuilder("user").where("email = :email", { email: email }).getOne();
                if (dbUser !== undefined) {
                    const result = await this.assetRepository.query("SELECT a2.* from userAssets ua inner join asset a2 on a2.id  = ua.asset_id  where user_id = 9");
                    this.logger.debug(result);
                    resolve(result);
                } else {
                    throw Error('User with ID not found');
                }

                resolve(undefined);
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

    async fundWallet(userId: number, amount: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(userId);
                if (dbUser === undefined) {
                    throw Error('User with ID not found');
                }

                const address = this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                const result = await this.ethereumService.fundWallet(address.address, amount);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    async login(uro: LoginRequest): Promise<User> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser: User = await this.userRepository.createQueryBuilder("user")
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

    getPassphrase(): string {
        const passphrase = generateMnemonic();
        return passphrase;
    }

    async confirmEmail(tag: string): Promise<string> {
        const email = AES.decrypt(Buffer.from(tag, 'base64').toString('ascii'), process.env.KEY).toString(enc.Utf8)

        let dbUser: User = await this.userRepository.createQueryBuilder("user")
            .where("email = :email", { "email": email })
            .getOne();

        if (dbUser !== undefined) {
            throw Error("User with email address already exists");
        }


        if (dbUser !== undefined) {
            dbUser.activated = true;
            this.userRepository.save(dbUser).then(() => { });
            return "Email confirmation successful. You can now login on the app";
        }

        return "Can not find confirmation link.";
    }

    async createNseUser(ur: NseUserRequest): Promise<NseUserRequest> {
        return new Promise(async (resolve, reject) => {
            try {
                const salt = genSaltSync(12, 'a');
                const passwordHashed = hashSync(ur.email + ur.phone, salt);
                const passphraseHashed = AES.encrypt(passwordHashed + ur.userName + ur.userId + ur.userType, process.env.KEY).toString();

                let dbUser: User = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { "email": ur.email })
                    .getOne();

                if (dbUser !== undefined) {
                    throw Error("User with email address already exists");
                }

                let ngncAccountNumber = "0000000000";
                // if (uro.role !== Role.ADMIN && uro.bvn !== "11111111111" && +uro.bvn !== 11111111111) {
                //     ngncAccountNumber = await this.providusService.createBankAccount(uro.bvn, uro.firstName, uro.lastName, uro.middleName, uro.email); //"9972122390";
                // }

                let imageUrl = '';

                let role: Role = Role.ISSUER;
                if (ur.userType.toLocaleLowerCase() === 'broker') {
                    role = Role.BROKER;
                } else if (ur.userType.toLocaleLowerCase() === 'issuer') {
                    role = Role.ISSUER;
                } else if (ur.userType.toLocaleLowerCase() === 'investor') {
                    role = Role.INVESTOR;
                } else if (ur.userType.toLocaleLowerCase() === 'admin') {
                    role = Role.ADMIN;
                }

                const user: User = {
                    password: passwordHashed,
                    passphrase: passphraseHashed,
                    email: ur.email,
                    role: role,
                    bvn: '11111111111',
                    ngncAccountNumber: ngncAccountNumber,
                    firstName: ur.userName,
                    middleName: '',
                    lastName: '',
                    imageUrl: imageUrl,
                    activated: false,
                    approved: false,
                    userId: ur.userId,
                    phoneNumber: ur.phone,
                    address: '',
                    blockchainAddress: ''
                }
                
                dbUser = await this.userRepository.save(user);
                
                const address = this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                dbUser.blockchainAddress = address.address;
                await this.userRepository.save(dbUser);
                // TODO: give everyone 500K after registration. Remove this in production
                // TODO: Remove this in production
                this.ethereumService.fundWallet(address.address, 1);
                this.emailService.sendConfirmationEmail(dbUser);
                ur.blockchainAddress = address.address;
                resolve(ur);
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

                let ngncAccountNumber = "0000000000";
                // if (uro.role !== Role.ADMIN && uro.bvn !== "11111111111" && +uro.bvn !== 11111111111) {
                //     ngncAccountNumber = await this.providusService.createBankAccount(uro.bvn, uro.firstName, uro.lastName, uro.middleName, uro.email); //"9972122390";
                // }

                let imageUrl = '';
                if (uro.image === undefined || uro.image === '') {
                } else {
                    imageUrl = await this.imageService.uploadAssetImage(uro.image);
                }

                if (uro.userId === undefined) {
                    uro.userId = 0;
                }
                
                const user: User = {
                    password: passwordHashed,
                    passphrase: passphraseHashed,
                    email: uro.email,
                    role: uro.role,
                    bvn: uro.bvn,
                    ngncAccountNumber: ngncAccountNumber,
                    firstName: uro.firstName,
                    middleName: uro.middleName,
                    lastName: uro.lastName,
                    imageUrl: imageUrl,
                    activated: false,
                    approved: false,
                    userId: uro.userId,
                    phoneNumber: uro.phoneNumber,
                    address: uro.address,
                    blockchainAddress: ''
                }
                
                dbUser = await this.userRepository.save(user);

                const address = this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);

                dbUser.blockchainAddress = address.address;
                await this.userRepository.save(dbUser);                

                // TODO: give everyone 500K after registration. Remove this in production
                // TODO: Remove this in production
                this.ethereumService.fundWallet(address.address, 500000);
                this.emailService.sendConfirmationEmail(dbUser);
                resolve(dbUser);
            } catch (error) {
                reject(error);
            }
        });
    }
}
