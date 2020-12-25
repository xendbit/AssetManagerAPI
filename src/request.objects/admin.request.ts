import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class AdminRequest {
    @IsNotEmpty()
    @ApiProperty()
    email: string;

    @IsNotEmpty()
    @ApiProperty()
    password: string;

    @IsNotEmpty()
    @ApiProperty()
    passphrase: string;

    @IsNotEmpty()
    @ApiProperty()
    firstName: string;

    @IsNotEmpty()
    @ApiProperty()
    lastName: string;
}