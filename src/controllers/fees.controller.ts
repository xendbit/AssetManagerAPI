import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { Fees } from 'src/models/fees.model';
import { FeesService } from 'src/services/fees.service';
import { Response, ResponseUtils } from 'src/utils';

@Controller('/fees')
@ApiTags('admin')
export class FeesController {
    constructor(private feesService: FeesService) { }

    @Get('')
    async getFees(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.feesService.getFees());
    }

    @Post('')
    @Roles('admin')
    @ApiSecurity('api-key')
    async saveFees(@Body() fees: Fees): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.feesService.setFees(fees));
    }
}
