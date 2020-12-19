import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AES, enc } from 'crypto-js';
import { LoginRequest } from 'src/models/request.objects/login.request';
import { UserRequest } from 'src/models/request.objects/user.request';
import { Repository } from 'typeorm';
import { FundWalletRequest } from '../models/request.objects/fund.wallet.request';
import { User } from './../models/user.model';
import { Address, EthereumService } from './ethereum.service';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    
    @InjectRepository(User)
    private userRepository: Repository<User>

    constructor(private ethereumService: EthereumService) {
        //this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        //this.web3.eth.handleRevert = true;
    }

    // async setAccountBalance(setAccountBalanceRequest: SetAccountBalanceRequest) {
    //     const dbUser = await this.userRepository.query("SELECT * FROM user WHERE userId = ?", [setAccountBalanceRequest.userId]);
    //     if (dbUser.length === 1) {
    //         const password = AES.decrypt(dbUser[0].password, process.env.KEY).toString(enc.Utf8);
    //         this._getBalance(dbUser[0].address, password).then((res) => {
    //             const currentBalance = res;
    //             this.logger.log(`Current Balance: ${currentBalance}`);
    //             let difference = +currentBalance - setAccountBalanceRequest.newBalance;
    //             this.logger.log(`Difference: ${difference}`);
    //             if (difference > 0) {
    //                 // send difference from credentials to xendcredit
    //                 this.fundWallet(dbUser[0].address, process.env.CONTRACTOR, difference, password);
    //             } else if (difference < 0) {
    //                 difference *= -1;
    //                 // send difference from xendcredit to credentials
    //                 this.fundWallet(this.contractor, dbUser[0].address, difference, this.contractorPassword);
    //             }
    //         }, error => {
    //             throw error;
    //         });
    //     }
    // }

    async ownedShares(tokenId: number, userId: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(userId)
                if (dbUser !== undefined) {
                    //const balance: number = await this.AssetManagerContract.methods.ownedShares(tokenId, dbUser.address).call({ from: dbUser.address, gasPrice: '0' });
                    //resolve(balance);
                } else {
                    throw Error('User with ID not found');
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async getBalance(userId: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            try {
                const dbUser = await this.userRepository.findOne(userId);
                if (dbUser !== undefined) {
                    const address: Address = await this.ethereumService.getAddressFromEncryptedPK(dbUser.passphrase);
                    const balance: number = await this.ethereumService.getBalance(address.address);
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
