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
exports.UserService = void 0;
const user_model_1 = require("./../models/user.model");
const typeorm_1 = require("@nestjs/typeorm");
const common_1 = require("@nestjs/common");
const crypto_js_1 = require("crypto-js");
const web3_1 = __importDefault(require("web3"));
const config_1 = require("./../models/config");
const typeorm_2 = require("typeorm");
let UserService = class UserService {
    constructor() {
        this.web3 = new web3_1.default(config_1.Config.web3URL);
    }
    async getNewAddress(userId) {
        let dbUser = await this.userRepository.query("SELECT * FROM user WHERE userId = ?", [userId]);
        if (dbUser.length === 1) {
            return dbUser[0];
        }
        const password = config_1.Config.generatePassword(32);
        const account = this.web3.eth.accounts.create(password);
        const encrypted = crypto_js_1.AES.encrypt(password, 'tfyscanf').toString();
        const pkEncrypted = crypto_js_1.AES.encrypt(account.privateKey, 'tfyscanf').toString();
        this.web3.eth.personal.importRawKey(account.privateKey.replace('0x', ''), password);
        const user = {
            password: encrypted,
            privateKey: pkEncrypted,
            address: account.address,
            userId: userId
        };
        dbUser = await this.userRepository.save(user);
        return dbUser;
    }
};
__decorate([
    typeorm_1.InjectRepository(user_model_1.User),
    __metadata("design:type", typeorm_2.Repository)
], UserService.prototype, "userRepository", void 0);
UserService = __decorate([
    common_1.Injectable(),
    __metadata("design:paramtypes", [])
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map