import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { QueryFailedError, Repository } from 'typeorm';
import { Post, postSearchText } from './post.entity';
import { PostLike } from './like.entity';
import { PostComment } from './comment.entity';
import { PostsService, pagination, searchExpression } from './posts.service';
import { FeedQueryDto } from './dto/post-input.dto';

function fixture() {
  const posts = { existsBy: jest.fn().mockResolvedValue(true), create: jest.fn((input: Partial<Post>) => input), save: jest.fn().mockResolvedValue({}) };
  const likes = { insert: jest.fn(), delete: jest.fn() };
  const comments = { findOneBy: jest.fn(), save: jest.fn(), create: jest.fn() };
  return { posts, likes, comments, service: new PostsService(posts as unknown as Repository<Post>, likes as unknown as Repository<PostLike>, comments as unknown as Repository<PostComment>) };
}

describe('Posts service', () => {
  it('builds search text from every searchable field', () => {
    expect(postSearchText({ title: 'React', description: 'Design', code: 'const hello', tags: ['Accessibility'] }))
      .toBe('React Design const hello Accessibility');
    expect(postSearchText({ title: 'React', description: 'Design', code: null, tags: [] })).toBe('React Design ');
  });

  it('turns user input into literal required prefixes without accepting boolean syntax', () => {
    expect(searchExpression('React +react -CSS "ação" @8 <script>')).toBe('+react* +css* +ação* +8* +script*');
    expect(searchExpression('+-*()')).toBe('');
  });

  it('preserves encoded filters and pagination navigation', () => {
    const query = Object.assign(new FeedQueryDto(), { page: 2, limit: 2 });
    const result = pagination(query, 5, '/posts', { q: 'React & CSS', sort: 'likes' });
    expect(result.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
    expect(new URL(result.links.next!, 'http://api').searchParams.get('q')).toBe('React & CSS');
    expect(result.links.previous).toContain('page=1');
    expect(pagination(new FeedQueryDto(), 0, '/posts').links).toEqual({ self: '/posts?page=1&limit=20' });
  });

  it('treats only duplicate-key errors as an existing like', async () => {
    const { service, likes } = fixture();
    expect(await service.like('post', 'user')).toBe(true);
    likes.insert.mockRejectedValueOnce(new QueryFailedError('INSERT', [], Object.assign(new Error('Duplicate'), { code: 'ER_DUP_ENTRY' })));
    expect(await service.like('post', 'user')).toBe(false);
    likes.insert.mockRejectedValueOnce(new Error('Database unavailable'));
    await expect(service.like('post', 'user')).rejects.toThrow('Database unavailable');
  });

  it('rejects interactions on missing posts before writing', async () => {
    const { service, posts, likes } = fixture();
    posts.existsBy.mockResolvedValue(false);
    await expect(service.like('missing', 'user')).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.unlike('missing', 'user')).rejects.toBeInstanceOf(NotFoundException);
    expect(likes.insert).not.toHaveBeenCalled();
    expect(likes.delete).not.toHaveBeenCalled();
  });

  it('rejects parents from other posts and replies to replies', async () => {
    const { service, comments } = fixture();
    comments.findOneBy.mockResolvedValueOnce(null).mockResolvedValueOnce({ parentId: 'root' });
    await expect(service.createComment('post', { text: 'Hi', parentId: 'elsewhere' }, 'user')).rejects.toBeInstanceOf(NotFoundException);
    expect(comments.findOneBy).toHaveBeenCalledWith({ id: 'elsewhere', postId: 'post' });
    await expect(service.createComment('post', { text: 'Hi', parentId: 'reply' }, 'user')).rejects.toBeInstanceOf(UnprocessableEntityException);
    expect(comments.save).not.toHaveBeenCalled();
  });

  it('builds the search document before saving and uses the authenticated author', async () => {
    const { service, posts } = fixture();
    jest.spyOn(service, 'detail').mockResolvedValue({ id: 'created' } as never);
    await service.create({ title: 'Title', description: 'Description', tags: ['Tag'] }, 'viewer');
    expect(posts.save).toHaveBeenCalledWith(expect.objectContaining({ authorId: 'viewer', code: null, thumbnailUrl: null,
      searchText: 'Title Description  Tag' }));
  });
});
