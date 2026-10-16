import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { Post, postSearchText } from './post.entity';
import { PostLike } from './like.entity';
import { PostComment } from './comment.entity';
import { CommentsQueryDto, CreateCommentDto, CreatePostDto, FeedQueryDto, PaginationDto } from './dto/post-input.dto';
import { CommentDto, CommentsResponseDto, FeedResponseDto, PostDetailDto, PostDto, ResourceLinksDto } from './dto/post-response.dto';

export function searchExpression(query: string): string {
  // Users supply words, never raw MySQL boolean operators. Prefix matching supports typing/search chips.
  const words = query.match(/[\p{L}\p{N}_]+/gu) ?? [];
  return [...new Set(words.map((word) => word.toLowerCase()))].map((word) => `+${word}*`).join(' ');
}

export function pagination(query: PaginationDto, total: number, path: string, filters: Record<string, string> = {}) {
  const totalPages = Math.ceil(total / query.limit);
  const link = (page: number) => `${path}?${new URLSearchParams({ ...filters, page: String(page), limit: String(query.limit) })}`;
  return {
    meta: { page: query.page, limit: query.limit, total, totalPages },
    links: { self: link(query.page), ...(query.page > 1 ? { previous: link(query.page - 1) } : {}),
      ...(query.page < totalPages ? { next: link(query.page + 1) } : {}) },
  };
}

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post) private readonly posts: Repository<Post>,
    @InjectRepository(PostLike) private readonly likes: Repository<PostLike>,
    @InjectRepository(PostComment) private readonly comments: Repository<PostComment>,
  ) {}

  private postQuery(userId?: string) {
    return this.posts.createQueryBuilder('post').innerJoinAndSelect('post.author', 'author')
      .addSelect((qb) => qb.select('COUNT(*)').from(PostLike, 'likes').where('likes.postId = post.id'), 'likesCount')
      .addSelect((qb) => qb.select('COUNT(*)').from(PostComment, 'comments').where('comments.postId = post.id'), 'commentsCount')
      .addSelect((qb) => qb.select('COUNT(*)').from(PostLike, 'mine').where('mine.postId = post.id')
        .andWhere(userId ? 'mine.userId = :viewerId' : '1 = 0', { viewerId: userId }), 'likedByMe');
  }

  private postDto(post: Post, raw: Record<string, unknown>): PostDto {
    const self = `/posts/${post.id}`;
    return { id: post.id, author: { id: post.author.id, name: post.author.name }, title: post.title,
      description: post.description, thumbnailUrl: post.thumbnailUrl, tags: post.tags,
      createdAt: post.createdAt.toISOString(), likesCount: Number(raw.likesCount),
      commentsCount: Number(raw.commentsCount), likedByMe: Number(raw.likedByMe) > 0,
      links: { self, comments: `${self}/comments`, like: `${self}/likes/me` } };
  }

  async feed(query: FeedQueryDto, userId?: string): Promise<FeedResponseDto> {
    const qb = this.postQuery(userId);
    if (query.q) {
      const expression = searchExpression(query.q);
      if (expression) qb.andWhere('MATCH(post.searchText) AGAINST (:expression IN BOOLEAN MODE)', { expression });
      else qb.andWhere('1 = 0');
    }
    const total = await qb.getCount();
    if (query.sort === 'likes') qb.orderBy('likesCount', 'DESC');
    qb.addOrderBy('post.createdAt', 'DESC').addOrderBy('post.id', 'DESC');
    const { entities, raw } = await qb.offset((query.page - 1) * query.limit).limit(query.limit)
      .getRawAndEntities<Record<string, unknown>>();
    const filters = { sort: query.sort, ...(query.q ? { q: query.q } : {}) };
    return { data: entities.map((post, index) => this.postDto(post, raw[index])), ...pagination(query, total, '/posts', filters) };
  }

  async detail(id: string, userId?: string): Promise<PostDetailDto> {
    const { entities, raw } = await this.postQuery(userId).where('post.id = :id', { id }).getRawAndEntities<Record<string, unknown>>();
    if (!entities[0]) throw new NotFoundException('Post not found');
    return { ...this.postDto(entities[0], raw[0]), code: entities[0].code };
  }

  async create(input: CreatePostDto, authorId: string): Promise<PostDetailDto> {
    const post = this.posts.create({ ...input, id: randomUUID(), authorId, code: input.code || null,
      thumbnailUrl: input.thumbnailUrl ?? null });
    post.searchText = postSearchText(post);
    await this.posts.save(post);
    return this.detail(post.id, authorId);
  }

  private async requirePost(postId: string): Promise<void> {
    if (!await this.posts.existsBy({ id: postId })) throw new NotFoundException('Post not found');
  }

  async like(postId: string, userId: string): Promise<boolean> {
    await this.requirePost(postId);
    try {
      await this.likes.insert({ postId, userId });
      return true;
    } catch (error) {
      if (error instanceof QueryFailedError && (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY') return false;
      throw error;
    }
  }

  async unlike(postId: string, userId: string): Promise<void> {
    await this.requirePost(postId);
    await this.likes.delete({ postId, userId });
  }

  private commentQuery() {
    return this.comments.createQueryBuilder('comment').innerJoinAndSelect('comment.author', 'author')
      .addSelect((qb) => qb.select('COUNT(*)').from(PostComment, 'reply').where('reply.parentId = comment.id'), 'repliesCount');
  }

  private commentDto(comment: PostComment, raw: Record<string, unknown>): CommentDto {
    const post = `/posts/${comment.postId}`;
    const links: ResourceLinksDto = { self: `${post}/comments/${comment.id}`, post };
    if (!comment.parentId) links.replies = `${post}/comments?parentId=${comment.id}`;
    return { id: comment.id, postId: comment.postId, parentId: comment.parentId, text: comment.text,
      author: { id: comment.author.id, name: comment.author.name }, createdAt: comment.createdAt.toISOString(),
      repliesCount: Number(raw.repliesCount), links };
  }

  private async requireParent(postId: string, parentId: string): Promise<void> {
    const parent = await this.comments.findOneBy({ id: parentId, postId });
    if (!parent) throw new NotFoundException('Parent comment not found in this post');
    if (parent.parentId) throw new UnprocessableEntityException('Replies can only target root comments');
  }

  async listComments(postId: string, query: CommentsQueryDto): Promise<CommentsResponseDto> {
    await this.requirePost(postId);
    if (query.parentId) await this.requireParent(postId, query.parentId);
    const qb = this.commentQuery().where('comment.postId = :postId', { postId })
      .andWhere(query.parentId ? 'comment.parentId = :parentId' : 'comment.parentId IS NULL', { parentId: query.parentId });
    const total = await qb.getCount();
    const { entities, raw } = await qb.orderBy('comment.createdAt', 'ASC').addOrderBy('comment.id', 'ASC')
      .offset((query.page - 1) * query.limit).limit(query.limit).getRawAndEntities<Record<string, unknown>>();
    return { data: entities.map((comment, index) => this.commentDto(comment, raw[index])),
      ...pagination(query, total, `/posts/${postId}/comments`, query.parentId ? { parentId: query.parentId } : {}) };
  }

  async comment(postId: string, commentId: string): Promise<CommentDto> {
    const { entities, raw } = await this.commentQuery().where('comment.postId = :postId AND comment.id = :commentId', { postId, commentId })
      .getRawAndEntities<Record<string, unknown>>();
    if (!entities[0]) throw new NotFoundException('Comment not found');
    return this.commentDto(entities[0], raw[0]);
  }

  async createComment(postId: string, input: CreateCommentDto, authorId: string): Promise<CommentDto> {
    await this.requirePost(postId);
    if (input.parentId) await this.requireParent(postId, input.parentId);
    const comment = await this.comments.save(this.comments.create({ id: randomUUID(), postId, authorId,
      text: input.text, parentId: input.parentId ?? null }));
    return this.comment(postId, comment.id);
  }
}
