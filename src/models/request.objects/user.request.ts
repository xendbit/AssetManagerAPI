import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UserRequest {
    @ApiProperty()
    @IsNotEmpty()
    passphrase: string;
    @ApiProperty()
    @IsNotEmpty()
    password: string;
    @ApiProperty()
    @IsNotEmpty()
    email: string;
}