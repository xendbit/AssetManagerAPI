import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { OrderRequest } from 'src/models/request.objects/order.requet';
import { Order } from 'src/models/order.model';
import { TokenShares } from 'src/models/token.shares.model';
import { AssetRequest } from 'src/models/request.objects/asset-request';
import { Pagination } from 'nestjs-typeorm-paginate';
import { Response, ResponseUtils } from 'src/utils';

@Controller('/assets')
@ApiTags('asset-manager')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post('/issue-asset')
    @Roles('admin')
    @ApiSecurity('api-key')
    async createNewAsset(@Body() asset: AssetRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.issueAsset(asset));
    }

    @Get('by-token-id/:tokenId')
    async findAssetByTokenId(@Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.findAssetByTokenId(tokenId))
    }

    @Get('by-issuer/:issuerId')
    async listAssetByIssuer(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Param("issuerId") issuerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listAssetsByIssuer({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }, issuerId));
    }

    @Get('by-owner/:ownerId')
    async listAssetByOwner(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Param("issuerId") ownerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listAssetsByIssuer({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }, ownerId));
    }    

    @Get('')
    async listAssets(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listAssets({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }));
    }

    @Post('new-order')
    @Roles('admin')
    @ApiSecurity('api-key')
    postNewOrder(@Body() or: OrderRequest): Promise<Order> {
        return this.assetsService.postOrder(or);
    }

    @Get('orders')
    async listOrders(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listOrders({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }));
    }

    @Get('orders/by-buyer/:buyerId')
    async listOrdersByBuyerId(@Query('page') page: number, @Query('limit') limit: number, @Param("buyerId") buyerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listOrdersByBuyer({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }, buyerId));
    }

    @Get('orders/by-seller/:sellerId')
    async listOrdersBySellerId(@Query('page') page: number, @Query('limit') limit: number, @Param("sellerId") sellerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listOrdersBySeller({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }, sellerId));
    }

    @Get('orders/by-token-id/:tokenId')
    async listOrdersByTokenId(@Query('page') page: number, @Query('limit') limit: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listOrdersByTokenId({
            page,
            limit,
            route: 'http://localhost:8081/v3/assets',
        }, tokenId));
    }

    @Get('orders/:id')
    async findOrderByKey(@Param("id") id: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.findOrderById(id));
    }

}
