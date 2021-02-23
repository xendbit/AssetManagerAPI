import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Holiday {
    @PrimaryGeneratedColumn()
    id?: number;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    day: number;
    
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    month: string;    
}