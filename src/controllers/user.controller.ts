import { Roles } from './../decorators/roles.decorator';
import { UserService } from './../services/user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response, ResponseUtils } from 'src/utils';
import { UserRequest } from 'src/request.objects/user.request';
import { LoginRequest } from 'src/request.objects/login.request';
import { FundWalletRequest } from 'src/request.objects/fund.wallet.request';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('new-user')
    @Roles('admin')
    @ApiSecurity('api-key')
    async newUser(@Body() uro: UserRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.getNewAddress(uro));
    }
    
    @Post('login')
    @Roles('admin')
    @ApiSecurity('api-key')
    async login(@Body() lr: LoginRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.login(lr));
    }

    @Post('fund-wallet')
    @Roles('admin')
    @ApiSecurity('api-key')
    async fundWallet(@Body() fwr: FundWalletRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.fundWallet(fwr));
    }

    @Get('wallet-balance/:userId')
    async getWalletBalance(@Param("userId") userId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.getWalletBalance(userId));
    }

    @Get('owned-shares/:userId/:tokenId')
    async ownedShares(@Param("userId") userId: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.ownedShares(tokenId, userId));
    }    
}