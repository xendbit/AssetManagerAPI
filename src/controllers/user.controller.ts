import { Roles } from './../decorators/roles.decorator';
import { FundWalletRequest } from '../models/request.objects/fund.wallet.request';
import { UserService } from './../services/user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { UserRequest } from 'src/models/request.objects/user.request';
import { User } from 'src/models/user.model';
import { LoginRequest } from 'src/models/request.objects/login.request';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Post('new-user')
    @Roles('admin')
    @ApiSecurity('api-key')
    getNewAddress(@Body() uro: UserRequest): Promise<User> {
        return this.userService.getNewAddress(uro);
    }

    @Post('login')
    @Roles('admin')
    @ApiSecurity('api-key')
    login(@Body() lr: LoginRequest): Promise<User> {
        return this.userService.login(lr);
    }

    @Post('fund-wallet')
    @Roles('admin')
    @ApiSecurity('api-key')
    fundWallet(@Body() fwr: FundWalletRequest) {
        return this.userService.fundWallet(fwr);
    }

    @Get('wallet-balance/:userId')
    getWalletBalance(@Param("userId") userId: number): Promise<number> {
        return this.userService.getWalletBalance(userId);
    }

    @Get('owned-shares/:userId/:tokenId')
    ownedShares(@Param("userId") userId: number, @Param("tokenId") tokenId: number): Promise<number> {
        return this.userService.ownedShares(userId, tokenId);
    }    
}