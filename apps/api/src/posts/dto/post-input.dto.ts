import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayMaxSize, ArrayUnique, IsArray, IsIn, IsInt, IsString, IsUrl, IsUUID, Length, Max, MaxLength, Min, ValidateIf } from 'class-validator';

const trim = ({ value }: { value: unknown }): unknown => typeof value === 'string' ? value.trim() : value;
const optional = (_object: unknown, value: unknown): boolean => value !== undefined;

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @Transform(({ value }: { value: unknown }) => typeof value === 'string' && /^\d+$/.test(value) ? Number(value) : value)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class FeedQueryDto extends PaginationDto {
  @ApiPropertyOptional({ maxLength: 200, description: 'Full-text words; all terms must match. Case/accent insensitive.' })
  @ValidateIf(optional)
  @Transform(trim)
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: ['recent', 'likes'], default: 'recent' })
  @IsIn(['recent', 'likes'])
  sort: 'recent' | 'likes' = 'recent';
}

export class CommentsQueryDto extends PaginationDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Omit for top-level comments; provide a root comment ID for replies.' })
  @ValidateIf(optional)
  @IsUUID()
  parentId?: string;
}

export class CreatePostDto {
  @ApiProperty({ maxLength: 160, example: 'Componentes acessíveis com React' })
  @Transform(trim)
  @IsString()
  @Length(1, 160)
  title!: string;

  @ApiProperty({ maxLength: 5000, example: 'Um projeto sobre acessibilidade e composição de componentes.' })
  @Transform(trim)
  @IsString()
  @Length(1, 5000)
  description!: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 50000, example: 'const greeting = "Olá!";' })
  @ValidateIf((_object, value: unknown) => value !== undefined && value !== null)
  @IsString()
  @MaxLength(50000)
  code?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2048, example: 'https://example.com/project.png' })
  @ValidateIf((_object, value: unknown) => value !== undefined && value !== null)
  @Transform(trim)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, require_tld: false, disallow_auth: true })
  @MaxLength(2048)
  thumbnailUrl?: string | null;

  @ApiPropertyOptional({ type: [String], maxItems: 10, default: [], example: ['React', 'Acessibilidade'] })
  @Transform(({ value }: { value: unknown }) => Array.isArray(value) ? value.map((tag: unknown) => typeof tag === 'string' ? tag.trim() : tag) : value)
  @IsArray()
  @ArrayMaxSize(10)
  @ArrayUnique((tag: unknown) => typeof tag === 'string' ? tag.toLowerCase() : tag)
  @IsString({ each: true })
  @Length(1, 30, { each: true })
  tags: string[] = [];
}

export class CreateCommentDto {
  @ApiProperty({ maxLength: 2000, example: 'Gostei da abordagem!' })
  @Transform(trim)
  @IsString()
  @Length(1, 2000)
  text!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Root comment of this same post; replies cannot have replies.' })
  @ValidateIf(optional)
  @IsUUID()
  parentId?: string;
}
