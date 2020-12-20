import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssetTransferRequest } from '../models/request.objects/asset-transfer-request';
import { AssetsService } from '../services/assets.service';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { OrderRequest } from 'src/models/request.objects/order.requet';
import { Order } from 'src/models/order.model';
import { TokenShares } from 'src/models/token.shares.model';
import { AssetRequest } from 'src/models/request.objects/asset-request';
import { Pagination } from 'nestjs-typeorm-paginate';

@Controller('/assets')
@ApiTags('asset-manager')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post('/issue-asset')
    @Roles('admin')
    @ApiSecurity('api-key')
    createNewAsset(@Body() asset: AssetRequest): Promise<TokenShares> {
        return this.assetsService.issueAsset(asset);
    }

    // @Get('by-token/:tokenId')
    // findAssetByTokenId(@Param("tokenId") tokenId: number): Promise<TokenShares> {
    //     return this.assetsService.findAssetByTokenId(tokenId)
    // }

    // @Get('by-issuer/:issuerId')
    // listAssetByIssuer(
    //     @Query('page') page: number,
    //     @Query('limit') limit: number,
    //     @Param("issuerId") issuerId: number): Promise<Pagination<TokenShares>> {
    //     return this.assetsService.listAssetsByIssuer({
    //         page,
    //         limit,
    //         route: 'http://localhost:8081/v3/assets',
    //     }, issuerId);
    // }

    // @Get('')
    // listAssets(@Query('page') page: number = 1, @Query('limit') limit: number = 10): Promise<Pagination<TokenShares>> {
    //     return this.assetsService.listAssets({
    //         page,
    //         limit,
    //         route: 'http://localhost:8081/v3/assets',
    //     });
    // }

    // @Post('/buy')
    // @Roles('admin')
    // @ApiSecurity('api-key')
    // buyAsset(@Body() assetTranfer: AssetTransferRequest): Promise<number> {
    //     return this.assetsService.buyAsset(assetTranfer);
    // }

    // @Post('new-order')
    // @Roles('admin')
    // @ApiSecurity('api-key')
    // postNewOrder(@Body() or: OrderRequest): Promise<Order> {
    //     return this.assetsService.postOrder(or);
    // }
}
