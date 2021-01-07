import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";
import { Column } from "typeorm";
import { Role } from "./enums";

export abstract class UserBase {
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    passphrase: string;

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    password: string;
    
    @ApiProperty()
    @IsNotEmpty()
    @Column()
    email: string;    

    @ApiProperty()
    @IsNotEmpty()
    @Column()
    role: Role
}