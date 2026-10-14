import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export const normalizeEmail = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim().toLowerCase() : value;

export class CreateUserDto {
  @ApiProperty({ example: 'Ana Silva', minLength: 1 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  @Transform(normalizeEmail)
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'senha-segura-123', minLength: 8, maxLength: 128, writeOnly: true })
  @IsString()
  @Length(8, 128)
  password!: string;
}
