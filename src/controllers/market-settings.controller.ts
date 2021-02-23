import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles.decorator';
import { MarketSettings } from 'src/models/market.settings.model';
import { MarketSettingsService } from 'src/services/market-settings.service';
import { Response, ResponseUtils } from 'src/utils';

@Controller('/market-settings')
@ApiTags("admin")
export class MarketSettingsController {
    constructor(private marketSettingsService: MarketSettingsService) { }

    @Get('')
    async getFees(): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.marketSettingsService.getMarketSettings());
    }

    @Post('')
    @Roles('admin')
    @ApiSecurity('api-key')
    async saveFees(@Body() ms: MarketSettings): Promise<Response> {
        return ResponseUtils.getSuccessResponse(await this.marketSettingsService.setMarketSettings(ms));
    }    
}
