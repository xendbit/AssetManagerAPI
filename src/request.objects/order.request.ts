import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { OrderStrategy, OrderType } from 'src/models/enums';

export class OrderRequest {
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    tokenId: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    orderType: OrderType;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    orderStrategy: OrderStrategy;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    amount: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    price: number;

    @IsNotEmpty()
    @ApiProperty()
    @IsNumber()
    goodUntil: number;

    @IsNotEmpty()
    @IsNumber()
    @ApiProperty()
    userId: number;
    
    key?: string;

    @ApiProperty()
    orderId?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    market: number;
}