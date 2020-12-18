import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from "class-validator";

export class AssetRequest {
    @IsNotEmpty()
    @ApiProperty()
    public name: string;
    @IsNotEmpty()
    @ApiProperty()
    public symbol: string;
    @IsNumber()
    @ApiProperty()
    public totalSupply: number;
    @IsNumber()
    @ApiProperty()
    public issuingPrice: number;
    @IsNotEmpty()
    @ApiProperty()
    public issuerId: number;    
}