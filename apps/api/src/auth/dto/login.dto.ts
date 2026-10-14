import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { normalizeEmail } from '../../users/dto/create-user.dto';

export class LoginDto {
  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha-segura-123', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
