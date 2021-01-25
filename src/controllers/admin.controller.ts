import { Controller, Param, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { AdminService } from 'src/services/admin.service';
import { Response, ResponseUtils } from 'src/utils';

@ApiTags('admin')
@Controller('admin')
export class AdminController {
    constructor(private adminService: AdminService) {}    

    @Post('change-approval-status/:tokenId/:status')
    @Roles('admin')
    @ApiSecurity('api-key')
    async changeApprovalStatus(@Param("tokenId") tokenId: number, @Param("status") status: boolean): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.adminService.changeApprovalStatus(tokenId, status));
    }    

    @Post('change-asset-market/:tokenId/:market')
    @Roles('admin')
    @ApiSecurity('api-key')
    async changeAssetMarket(@Param("tokenId") tokenId: number, @Param("market") market: number): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.adminService.changeAssetMarket(tokenId, market));
    }        
}
