import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MarketSettings {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    percMinBuyQuantity: number;

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    percPriceChangeLimit: number;    

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    primaryMarketHoldingPeriod: number;    

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    maxNoOfDaysForInfinityOrders: number;    
}