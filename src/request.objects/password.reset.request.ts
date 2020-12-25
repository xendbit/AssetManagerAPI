import { ApiProperty } from "@nestjs/swagger";

export class PasswordResetRequest {
    @ApiProperty()
    email?: string;
    @ApiProperty()
    token?: string;    
    @ApiProperty()
    newPassword?: string;
}