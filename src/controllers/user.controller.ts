import { Roles } from './../decorators/roles.decorator';
import { SetAccountBalanceRequest } from './../models/request.objects/set-account-balance-request';
import { UserService } from './../services/user.service';
import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('user')
@Controller('user')
export class UserController {
    constructor(private userService: UserService) {}

    @Get('new-address/:id')
    @Roles('all')
    getNewAddress(@Param('id', ParseIntPipe) id: number) {
        return this.userService.getNewAddress(id);
    }

    @Roles('admin')
    @ApiSecurity('access-key')
    @Post('set-balance')    
    setAccountBalance(@Body() setAccountBalanceRequest: SetAccountBalanceRequest) {
        this.userService.setAccountBalance(setAccountBalanceRequest);
        return "Set Account Balance Request Submitted Successfully";
    }

    @Get('get-balance/:id')
    @Roles('all')
    getAccountBalance(@Param('id', ParseIntPipe) id: number): Promise<string> {
        return this.userService.getBalance(id);
    }    

    @Get('get-shares/:tokenId/:id')
    @Roles('all')
    getSharesBalance(@Param('tokenId', ParseIntPipe) tokenId: number, @Param('id', ParseIntPipe) id: number): Promise<string> {
        return this.userService.getSharesBalance(tokenId, id);
    }        
}