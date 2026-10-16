import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResourceLinksDto {
  @ApiProperty({ example: '/posts/uuid' })
  self!: string;

  @ApiPropertyOptional()
  post?: string;
  @ApiPropertyOptional()
  comments?: string;
  @ApiPropertyOptional()
  like?: string;
  @ApiPropertyOptional()
  replies?: string;
  @ApiPropertyOptional()
  next?: string;
  @ApiPropertyOptional()
  previous?: string;
}

export class AuthorDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty()
  name!: string;
}

export class PostDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty({ type: AuthorDto })
  author!: AuthorDto;
  @ApiProperty()
  title!: string;
  @ApiProperty()
  description!: string;
  @ApiProperty({ nullable: true, type: String })
  thumbnailUrl!: string | null;
  @ApiProperty({ type: [String] })
  tags!: string[];
  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
  @ApiProperty()
  likesCount!: number;
  @ApiProperty({ description: 'Includes root comments and replies.' })
  commentsCount!: number;
  @ApiProperty()
  likedByMe!: boolean;
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
}

export class PostDetailDto extends PostDto {
  @ApiProperty({ nullable: true, type: String })
  code!: string | null;
}

export class CommentDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;
  @ApiProperty({ format: 'uuid' })
  postId!: string;
  @ApiProperty({ type: AuthorDto })
  author!: AuthorDto;
  @ApiProperty({ type: String, nullable: true, format: 'uuid' })
  parentId!: string | null;
  @ApiProperty()
  text!: string;
  @ApiProperty({ format: 'date-time' })
  createdAt!: string;
  @ApiProperty()
  repliesCount!: number;
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
}

export class PageMetaDto {
  @ApiProperty()
  page!: number;
  @ApiProperty()
  limit!: number;
  @ApiProperty()
  total!: number;
  @ApiProperty()
  totalPages!: number;
}

export class PostResponseDto {
  @ApiProperty({ type: PostDetailDto })
  data!: PostDetailDto;
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
}
export class FeedResponseDto {
  @ApiProperty({ type: [PostDto] })
  data!: PostDto[];
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;
}
export class CommentResponseDto {
  @ApiProperty({ type: CommentDto })
  data!: CommentDto;
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
}
export class CommentsResponseDto {
  @ApiProperty({ type: [CommentDto] })
  data!: CommentDto[];
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
  @ApiProperty({ type: PageMetaDto })
  meta!: PageMetaDto;
}
export class LikeResponseDto {
  @ApiProperty({ example: { postId: 'uuid', userId: 'uuid' } })
  data!: { postId: string; userId: string };
  @ApiProperty({ type: ResourceLinksDto })
  links!: ResourceLinksDto;
}
