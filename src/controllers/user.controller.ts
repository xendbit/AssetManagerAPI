import { Roles } from './../decorators/roles.decorator';
import { UserService } from './../services/user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Response, ResponseUtils } from 'src/utils';
import { UserRequest } from 'src/request.objects/user.request';
import { LoginRequest } from 'src/request.objects/login.request';
import { PasswordResetRequest } from 'src/request.objects/password.reset.request';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('')
    async listUsers(@Query('page') page: number, @Query('limit') limit: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.listUsers({
            page,
            limit,
            route: '/v3/users'
        }));
    }

    @Get(':id')
    async getUser(@Param('id') id: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.getUserById(id));
    }

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

    @Get('fund-wallet/:accountNumber/:amount')
    @Roles('admin')
    @ApiSecurity('api-key')
    async fundWallet(@Param('accountNumber') accountNumber: string, @Param('amount') amount: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.fundWallet(accountNumber, amount));
    }

    @Get('wallet-balance/:userId')
    async getWalletBalance(@Param("userId") userId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.getWalletBalance(userId));
    }

    @Get('owned-shares/:userId/:tokenId')
    async ownedShares(@Param("userId") userId: number, @Param("tokenId") tokenId: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.ownedShares(tokenId, userId));
    }    

    @Post('request-password-reset-token')
    @Roles('admin')
    @ApiSecurity('api-key')
    async requestPasswordToken(@Body() pro: PasswordResetRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.requestPasswordToken(pro));
    }

    @Post('change-password')
    @Roles('admin')
    @ApiSecurity('api-key')
    async changePassword(@Body() pro: PasswordResetRequest): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.userService.changePassword(pro));
    }    
}