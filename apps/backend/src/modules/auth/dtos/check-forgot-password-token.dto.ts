import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CheckForgotPasswordTokenDto {
  @ApiProperty({ description: 'Forgot password token' })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  declare token: string;
}
