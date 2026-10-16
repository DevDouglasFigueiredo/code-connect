import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post as HttpPost, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiExtraModels, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard, type AuthenticatedRequest, OptionalAuthGuard } from '../auth/auth.guard';
import { ErrorResponseDto } from '../common/response.dto';
import { CommentsQueryDto, CreateCommentDto, CreatePostDto, FeedQueryDto } from './dto/post-input.dto';
import { CommentResponseDto, CommentsResponseDto, FeedResponseDto, LikeResponseDto, PostResponseDto } from './dto/post-response.dto';
import { PostsService } from './posts.service';

interface PublicRequest { user?: { sub: string } }
interface ResponseHeaders { setHeader(name: string, value: string): void; status(code: number): void }
const uuid = () => new ParseUUIDPipe({ errorHttpStatusCode: 422 });
const locationHeader = { Location: { description: 'URI of the created resource', schema: { type: 'string' } } };

@ApiTags('Posts')
@ApiExtraModels(ErrorResponseDto)
@ApiResponse({ status: 401, description: 'Invalid/missing token or user no longer exists', type: ErrorResponseDto })
@ApiResponse({ status: 404, description: 'Resource not found', type: ErrorResponseDto })
@ApiResponse({ status: 422, description: 'Invalid input or reply depth', type: ErrorResponseDto })
@Controller('posts')
export class PostsController {
  constructor(private readonly posts: PostsService) {}

  @Get()
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Public feed; optional Bearer token includes likedByMe', security: [{}, { bearer: [] }] })
  @ApiOkResponse({ type: FeedResponseDto })
  feed(@Query() query: FeedQueryDto, @Req() request: PublicRequest) {
    return this.posts.feed(query, request.user?.sub);
  }

  @HttpPost()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Publish a post as the authenticated user' })
  @ApiCreatedResponse({ type: PostResponseDto, headers: locationHeader })
  async create(@Body() input: CreatePostDto, @Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: ResponseHeaders) {
    const data = await this.posts.create(input, request.user.sub);
    response.setHeader('Location', data.links.self);
    return { data, links: data.links };
  }

  @Get(':id')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Public post details; optional Bearer token includes likedByMe', security: [{}, { bearer: [] }] })
  @ApiOkResponse({ type: PostResponseDto })
  async detail(@Param('id', uuid()) id: string, @Req() request: PublicRequest) {
    const data = await this.posts.detail(id, request.user?.sub);
    return { data, links: data.links };
  }

  @Put(':id/likes/me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post; repeated and concurrent requests never duplicate the like' })
  @ApiCreatedResponse({ type: LikeResponseDto, headers: locationHeader })
  @ApiNoContentResponse({ description: 'Already liked' })
  async like(@Param('id', uuid()) id: string, @Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: ResponseHeaders) {
    if (!await this.posts.like(id, request.user.sub)) {
      response.status(204);
      return;
    }
    const self = `/posts/${id}/likes/me`;
    response.status(201);
    response.setHeader('Location', self);
    return { data: { postId: id, userId: request.user.sub }, links: { self, post: `/posts/${id}` } };
  }

  @Delete(':id/likes/me')
  @HttpCode(204)
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove your like, including when already absent' })
  @ApiNoContentResponse()
  async unlike(@Param('id', uuid()) id: string, @Req() request: AuthenticatedRequest) {
    await this.posts.unlike(id, request.user.sub);
  }

  @Get(':id/comments')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Read root comments, or replies using parentId', security: [{}, { bearer: [] }] })
  @ApiOkResponse({ type: CommentsResponseDto })
  comments(@Param('id', uuid()) id: string, @Query() query: CommentsQueryDto) {
    return this.posts.listComments(id, query);
  }

  @Get(':id/comments/:commentId')
  @UseGuards(OptionalAuthGuard)
  @ApiOperation({ summary: 'Read one comment', security: [{}, { bearer: [] }] })
  @ApiOkResponse({ type: CommentResponseDto })
  async comment(@Param('id', uuid()) id: string, @Param('commentId', uuid()) commentId: string) {
    const data = await this.posts.comment(id, commentId);
    return { data, links: data.links };
  }

  @HttpPost(':id/comments')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Comment on a post or reply to a root comment' })
  @ApiCreatedResponse({ type: CommentResponseDto, headers: locationHeader })
  async createComment(@Param('id', uuid()) id: string, @Body() input: CreateCommentDto,
    @Req() request: AuthenticatedRequest, @Res({ passthrough: true }) response: ResponseHeaders) {
    const data = await this.posts.createComment(id, input, request.user.sub);
    response.setHeader('Location', data.links.self);
    return { data, links: data.links };
  }
}
