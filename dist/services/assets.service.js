"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsService = void 0;
const crypto_js_1 = require("crypto-js");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_model_1 = require("./../models/user.model");
const common_1 = require("@nestjs/common");
const config_1 = require("../models/config");
const asset_model_1 = require("../models/asset.model");
const web3_1 = __importDefault(require("web3"));
const path = require("path");
const fs = require("fs");
let AssetsService = class AssetsService {
    constructor() {
        this.contractAddress = config_1.Config.contractAddress;
        this.abiPath = config_1.Config.abiPath;
        this.abi = JSON.parse(fs.readFileSync(path.resolve(this.abiPath), 'utf8'));
        this.web3 = new web3_1.default(config_1.Config.web3URL);
        this.web3.eth.handleRevert = true;
        this.AssetManagerContract = new this.web3.eth.Contract(this.abi.abi, this.contractAddress);
    }
    async transferAsset(assetTransfer) {
        const query = "SELECT * FROM user WHERE userId = ?";
        const issuerUser = await this.userRepository.query(query, [assetTransfer.assetIssuerId]);
        if (issuerUser.length !== 1) {
            throw new Error(`Issuer with id ${assetTransfer.assetIssuerId} not found`);
        }
        const senderUser = await this.userRepository.query(query, [assetTransfer.senderId]);
        if (senderUser.length !== 1) {
            throw new Error(`Sender with id ${assetTransfer.senderId} not found`);
        }
        const recipientUser = await this.userRepository.query(query, [assetTransfer.recipientId]);
        if (recipientUser.length !== 1) {
            throw new Error(`Recipient with id ${assetTransfer.recipientId} not found`);
        }
        const from = senderUser[0].address;
        const to = recipientUser[0].address;
        const assetName = assetTransfer.assetName;
        const assetIssuer = issuerUser[0].address;
        const password = crypto_js_1.AES.decrypt(senderUser[0].password, 'tfyscanf').toString(crypto_js_1.enc.Utf8);
        const quantity = assetTransfer.quantity;
        return new Promise((resolve, reject) => {
            this.web3.eth.personal.unlockAccount(from, password).then(() => {
                console.log(`Account ${from} unlocked`);
                this.AssetManagerContract.methods.transferAsset(to, assetName, assetIssuer, quantity).send({ from: from, gasPrice: '0' }).then(() => {
                    this.AssetManagerContract.methods.getAsset(assetName, assetIssuer, to).call({ from: to, gasPrice: '0' }).then((res) => {
                        resolve(asset_model_1.Asset.assetFromResponse(res));
                    }, error => {
                        reject(error);
                    });
                }, error => {
                    reject(error);
                });
            }, error => {
                reject(error);
            });
        });
    }
    async createAsset(asset) {
        const query = "SELECT * FROM user WHERE userId = ?";
        const issuerUser = await this.userRepository.query(query, [asset.issuerId]);
        if (issuerUser.length !== 1) {
            throw new Error(`Issuer with id ${asset.issuerId} not found`);
        }
        const issuer = issuerUser[0].address;
        const passsword = crypto_js_1.AES.decrypt(issuerUser[0].password, 'tfyscanf').toString(crypto_js_1.enc.Utf8);
        return new Promise((resolve, reject) => {
            this.web3.eth.personal.unlockAccount(issuer, passsword).then(() => {
                console.log(`Account ${issuer} unlocked`);
                const assetRequest = {
                    name: asset.name,
                    description: asset.description,
                    totalQuantity: asset.totalQuantity,
                    decimal: asset.decimal
                };
                this.AssetManagerContract.methods.createAsset(assetRequest).send({ from: issuer, gasPrice: '0' }).then(() => {
                    console.log(`Asset ${asset.name} created`);
                    this.AssetManagerContract.methods.getAsset(asset.name, issuer).call({ from: issuer, gasPrice: '0' }).then((res) => {
                        resolve(asset_model_1.Asset.assetFromResponse(res));
                    }, error => {
                        console.log("Error: ", error);
                        reject(error);
                    });
                });
            }, error => {
                reject(error);
            });
        });
    }
    getAssets() {
        return new Promise((resolve, reject) => {
            this.AssetManagerContract.methods.getAssets().call({ from: config_1.Config.dtslAddress, gasPrice: '0' }).then(result => {
                const allAssets = [];
                for (const res of result) {
                    if (res.id >= 0) {
                        allAssets.push(asset_model_1.Asset.assetFromResponse(res));
                    }
                }
                resolve(allAssets);
            }, error => {
                reject(error);
            });
        });
    }
};
__decorate([
    typeorm_1.InjectRepository(user_model_1.User),
    __metadata("design:type", typeorm_2.Repository)
], AssetsService.prototype, "userRepository", void 0);
AssetsService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], AssetsService);
exports.AssetsService = AssetsService;
//# sourceMappingURL=assets.service.js.map