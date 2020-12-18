import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { AES, enc, HmacSHA256 } from 'crypto-js';
import { LoginRequest } from 'src/models/request.objects/login.request';
import { UserRequest } from 'src/models/request.objects/user.request';
import { Repository } from 'typeorm';
import Web3 from 'web3';
import { FundWalletRequest } from '../models/request.objects/fund.wallet.request';
import { User } from './../models/user.model';
import path = require('path');
import fs = require('fs');
import { resolve } from 'path';

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private contractAddress: string;
    private abiPath: string;
    private abi;
    private AssetManagerContract;
    private web3;
    private contractor: string;
    private contractorPassword: string;

    @InjectRepository(User)
    private userRepository: Repository<User>

    constructor() {
        this.contractor = process.env.CONTRACTOR;
        this.contractorPassword = AES.decrypt(process.env.CONTRACTOR_PASS, process.env.KEY).toString(enc.Utf8);
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.abiPath = process.env.ABI_PATH;
        this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        this.web3 = new Web3(process.env.WEB3_URL);
        this.web3.eth.handleRevert = true;
        this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
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
                    const balance: number = await this.AssetManagerContract.methods.ownedShares(tokenId, dbUser.address).call({ from: dbUser.address, gasPrice: '0' });
                    resolve(balance);
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
                    const balance: number = await this.AssetManagerContract.methods.walletBalance(dbUser.address).call({ from: dbUser.address, gasPrice: '0' });
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
                const from = process.env.CONTRACTOR;
                const fromPassword = AES.decrypt(process.env.CONTRACTOR_PASS, process.env.KEY).toString(enc.Utf8);

                await this.web3.eth.personal.unlockAccount(from, fromPassword);
                await this.AssetManagerContract.methods.fundWallet(dbUser.address, fwr.amount).send({ from: from, gasPrice: '0' });
                this.logger.log(`${fwr.amount} transfered from ${from} to ${dbUser.address}`);
                resolve('Account funding successful');
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
                const passphraseHashed = HmacSHA256(uro.passphrase, process.env.KEY).toString();

                let dbUser: User = await this.userRepository.createQueryBuilder("user")
                    .where("email = :email", { "email": uro.email })
                    .getOne();

                if (dbUser !== undefined) {
                    throw Error("User with email address already exists");
                }

                const account = this.web3.eth.accounts.create(passphraseHashed);
                this.web3.eth.personal.importRawKey(account.privateKey.replace('0x', ''), passwordHashed);
                const pkHashed = AES.encrypt(account.privateKey, process.env.KEY).toString();

                const user: User = {
                    password: passwordHashed,
                    privateKey: pkHashed,
                    passphrase: passphraseHashed,
                    address: account.address,
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
