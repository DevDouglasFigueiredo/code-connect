import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LinksDto {
  @ApiProperty({ example: '/users/me' })
  self!: string;

  @ApiPropertyOptional({ example: '/sessions' })
  login?: string;

  @ApiPropertyOptional({ example: '/users/me' })
  profile?: string;
}

export class ErrorResponseDto {
  @ApiProperty({ example: 422 })
  statusCode!: number;

  @ApiProperty({ example: 'Validation failed' })
  message!: string;

  @ApiPropertyOptional({ type: [String], example: ['email must be an email'] })
  errors?: string[];
}
