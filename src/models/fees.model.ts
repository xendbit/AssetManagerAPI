import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Fees {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    smsNotification: number;

    @Column()
    @IsNotEmpty()
    @ApiProperty()
    nse: number;

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    transaction: number;    

    @IsNotEmpty()
    @ApiProperty()
    @Column()
    blockchain: number;
}