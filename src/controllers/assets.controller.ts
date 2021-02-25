import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { AssetsService } from '../services/assets.service';
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Order } from 'src/models/order.model';
import { Response, ResponseUtils } from 'src/utils';
import { AssetRequest } from 'src/request.objects/asset-request';
import { OrderRequest } from 'src/request.objects/order.request';
import { OrdersService } from 'src/services/orders.service';

@Controller('/assets')
@ApiTags('asset-manager')
export class AssetsController {
    constructor(
        private assetsService: AssetsService,
        private ordersService: OrdersService,
    ) { }

    @Post('issue-asset')
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
            route: '/v3/assets',
        }, issuerId));
    }

    @Get('by-owner/:ownerId')
    async listAssetByOwner(
        @Query('page') page: number,
        @Query('limit') limit: number,
        @Param("ownerId") ownerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listAssetsByOwner({
            page,
            limit,
            route: '/v3/assets',
        }, ownerId));
    }

    @Get('')
    async listAssets(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.assetsService.listAssets({
            page,
            limit,
            route: '/v3/assets',
        }));
    }

    @Post('new-order')
    @Roles('admin')
    @ApiSecurity('api-key')
    async postNewOrder(@Body() or: OrderRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.postOrder(or, false));
    }

    @Get('orders')
    async listOrders(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.listOrders({
            page,
            limit,
            route: '/v3/assets',
        }));
    }

    @Get('orders/by-buyer/:buyerId')
    async listOrdersByBuyerId(@Query('page') page: number, @Query('limit') limit: number, @Param("buyerId") buyerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.listOrdersByBuyer({
            page,
            limit,
            route: '/v3/assets',
        }, buyerId));
    }

    @Get('orders/by-seller/:sellerId')
    async listOrdersBySellerId(@Query('page') page: number, @Query('limit') limit: number, @Param("sellerId") sellerId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.listOrdersBySeller({
            page,
            limit,
            route: '/v3/assets',
        }, sellerId));
    }

    @Get('orders/by-token-id/:tokenId')
    async listOrdersByTokenId(@Query('page') page: number, @Query('limit') limit: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.listOrdersByTokenId({
            page,
            limit,
            route: '/v3/assets',
        }, tokenId));
    }

    @Get('orders/:id')
    async findOrderByKey(@Param("id") id: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.findOrderById(id));
    }

    @Roles('admin')
    @ApiSecurity('api-key')
    @Post('cancel-order/:id')
    async cancelOrder(@Param("id") id: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.ordersService.cancelOrder(id));
    }

}
