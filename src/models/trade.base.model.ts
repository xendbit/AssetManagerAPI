import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column } from "typeorm";

export abstract class TradeBaseClass {
    @IsNotEmpty()
    @ApiProperty()
    @Column()
    sellerEmail: string;
    
    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    buyerEmail: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    assetSymbol: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    numberOfTradeTokens: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    tradeId: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    tradeType: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    tradeDate: string;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    tradePrice: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()    
    totalTokensOwnedByUser: number;    
}