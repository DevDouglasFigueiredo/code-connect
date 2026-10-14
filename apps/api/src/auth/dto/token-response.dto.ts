import { ApiProperty } from '@nestjs/swagger';
import { LinksDto } from '../../common/response.dto';

export class TokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyLWlkIn0.signature' })
  access_token!: string;

  @ApiProperty({ enum: ['Bearer'], example: 'Bearer' })
  token_type!: 'Bearer';

  @ApiProperty({ example: 3600 })
  expires_in!: number;
}

export class TokenResponseDto {
  @ApiProperty({ type: TokenDto })
  data!: TokenDto;

  @ApiProperty({ type: LinksDto })
  links!: LinksDto;
}
