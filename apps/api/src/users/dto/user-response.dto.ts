import { ApiProperty } from '@nestjs/swagger';
import { LinksDto } from '../../common/response.dto';

export class UserDto {
  @ApiProperty({ format: 'uuid', example: 'f4f06b02-3811-47c0-a785-42332d282b7f' })
  id!: string;

  @ApiProperty({ example: 'Ana Silva' })
  name!: string;

  @ApiProperty({ example: 'ana@example.com', format: 'email' })
  email!: string;
}

export class UserResponseDto {
  @ApiProperty({ type: UserDto })
  data!: UserDto;

  @ApiProperty({ type: LinksDto })
  links!: LinksDto;
}
