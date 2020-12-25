import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class FundWalletRequest {    
    @ApiProperty()
    @IsNumber()
    public userId: number;
    @ApiProperty()
    @IsNumber()    
    public amount: number;
}