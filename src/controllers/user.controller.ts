import { Roles } from './../decorators/roles.decorator';
import { SetAccountBalanceRequest } from './../models/request.objects/set-account-balance-request';
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
    @ApiSecurity('access-key')
    getNewAddress(@Body() uro: UserRequest): Promise<User> {
        return this.userService.getNewAddress(uro);
    }

    @Post('login')
    @Roles('admin')
    @ApiSecurity('access-key')
    login(@Body() lr: LoginRequest): Promise<User> {
        return this.userService.login(lr);
    }
}