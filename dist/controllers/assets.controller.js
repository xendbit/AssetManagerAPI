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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssetsController = void 0;
const asset_transfer_request_1 = require("../models/request.objects/asset-transfer-request");
const new_asset_request_1 = require("../models/request.objects/new-asset-request");
const assets_service_1 = require("../services/assets.service");
const common_1 = require("@nestjs/common");
const asset_model_1 = require("../models/asset.model");
const roles_decorator_1 = require("../decorators/roles.decorator");
let AssetsController = class AssetsController {
    constructor(assetsService) {
        this.assetsService = assetsService;
    }
    getAllAssets() {
        return this.assetsService.getAssets();
    }
    createNewAsset(asset) {
        return this.assetsService.createAsset(asset);
    }
    transferAssset(assetTranfer) {
        return this.assetsService.transferAsset(assetTranfer);
    }
};
__decorate([
    common_1.Get(),
    roles_decorator_1.Roles('all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "getAllAssets", null);
__decorate([
    common_1.Post(),
    roles_decorator_1.Roles('all'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [new_asset_request_1.NewAssetRequest]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "createNewAsset", null);
__decorate([
    common_1.Post('/transfer'),
    roles_decorator_1.Roles('all'),
    __param(0, common_1.Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [asset_transfer_request_1.AssetTransferRequest]),
    __metadata("design:returntype", Promise)
], AssetsController.prototype, "transferAssset", null);
AssetsController = __decorate([
    common_1.Controller('/assets'),
    __metadata("design:paramtypes", [assets_service_1.AssetsService])
], AssetsController);
exports.AssetsController = AssetsController;
//# sourceMappingURL=assets.controller.js.map