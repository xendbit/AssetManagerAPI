import { Utils } from './../utils';
import { SetAccountBalanceRequest } from './../models/request.objects/set-account-balance-request';
import { User } from './../models/user.model';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable, Logger } from '@nestjs/common';
import { AES, enc } from 'crypto-js';
import Web3 from 'web3';
import { Repository } from 'typeorm';
import path = require('path');
import fs = require('fs');

@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);
    private contractAddress: string;
    private abiPath: string;
    private abi;
    private AssetManagerContract;
    private web3;

    @InjectRepository(User)
    private userRepository: Repository<User>

    constructor() {
        this.contractAddress = process.env.CONTRACT_ADDRESS;
        this.abiPath = process.env.ABI_PATH;
        this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        this.web3 = new Web3(process.env.WEB3_URL);
        this.web3.eth.handleRevert = true;
        this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
    }
    
    async setAccountBalance(setAccountBalanceRequest: SetAccountBalanceRequest) {
        const dbUser = await this.userRepository.query("SELECT * FROM user WHERE userId = ?", [setAccountBalanceRequest.userId]);
        if (dbUser.length === 1) {
            const password = AES.decrypt(dbUser[0].password, process.env.KEY).toString(enc.Utf8);
            this._getBalance(dbUser[0].address, password).then((res) => {
                const currentBalance = res;
                this.logger.log(`Current Balance: ${currentBalance}`);
                let difference = +currentBalance - setAccountBalanceRequest.newBalance;
                this.logger.log(`Difference: ${difference}`);
                if (difference > 0) {
                    // send difference from credentials to xendcredit
                    this.sendToken(dbUser[0].address, process.env.CONTRACTOR, difference, password);
                } else if (difference < 0) {
                    difference *= -1;
                    // send difference from xendcredit to credentials
                    this.sendToken(process.env.CONTRACTOR, dbUser[0].address, difference, process.env.CONTRACTOR_PASS);
                }
            }, error => {
                throw error;
            });
        }
    }

    async sendToken(from: string, to: string, amount: number, fromPassword: string) {
        await this.web3.eth.personal.unlockAccount(from, fromPassword);
        this.AssetManagerContract.methods.transferToken(to, amount).send({ from: from, gasPrice: '0' }).then(() => {
            this.logger.log(`${amount} transfered from ${from} to ${to}`);
        })
    }

    async getBalance(id: number): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const dbUser = await this.userRepository.query("SELECT * FROM user WHERE userId = ?", [id]);
            if (dbUser.length === 1) {
                const password = AES.decrypt(dbUser[0].password, process.env.KEY).toString(enc.Utf8);
                const balance:string = await this._getBalance(dbUser[0].address, password);
                resolve(balance);
            } else {
                reject('User with ID not found');
            }
        });
    }
    _getBalance(address: string, password: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            await this.web3.eth.personal.unlockAccount(address, password);
            this.logger.log(`Unlocked ${address}`);
            this.AssetManagerContract.methods.getTokenBalance().call({ from: address, gasPrice: '0' }).then((res) => {
                this.logger.log(`Xether Balance for ${address}: ${res}`);
                resolve(res);
            }, error => {
                reject(error);
            });
        });
    }

    async getNewAddress(userId: number) {
        let dbUser = await this.userRepository.query("SELECT * FROM user WHERE userId = ?", [userId]);
        if (dbUser.length === 1) {
            return dbUser[0];
        }

        const password = Utils.generatePassword(32);
        const account = this.web3.eth.accounts.create(password);
        const encrypted = AES.encrypt(password, process.env.KEY).toString();
        const pkEncrypted = AES.encrypt(account.privateKey, process.env.KEY).toString();
        this.web3.eth.personal.importRawKey(account.privateKey.replace('0x', ''), password);

        const user: User = {
            password: encrypted,
            privateKey: pkEncrypted,
            address: account.address,
            userId: userId
        }

        dbUser = await this.userRepository.save(user);
        return dbUser;
    }
}
