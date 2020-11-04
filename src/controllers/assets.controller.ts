import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { NewAssetRequest } from '../models/request.objects/new-asset-request';
import { AssetsService } from '../services/assets.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { Asset } from 'src/models/asset.model';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('/assets')
@ApiTags('asset-manager')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService){}
    
    @Get()
    @Roles('all')
    getAllAssets(): Promise<Asset[]> {
        return this.assetsService.getAssets();
    }

    @Post()
    @Roles('admin')
    @ApiSecurity('access-key')
    createNewAsset(@Body() asset: NewAssetRequest): Promise<Asset> {
        return this.assetsService.createAsset(asset);
    }

    @Post('/buy')
    @Roles('admin')
    @ApiSecurity('access-key')
    buyAsset(@Body() assetTranfer: AssetTransferRequest): Promise<Asset> {
        return this.assetsService.buyAsset(assetTranfer);
    }
}
