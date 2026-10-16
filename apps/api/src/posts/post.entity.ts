import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('posts')
@Index('IDX_posts_created', ['createdAt', 'id'])
@Index('IDX_posts_search', ['searchText'], { fulltext: true })
export class Post {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ type: 'char', length: 36 })
  authorId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'authorId' })
  author!: User;

  @Column({ type: 'varchar', length: 160 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'mediumtext', nullable: true })
  code!: string | null;

  @Column({ type: 'varchar', length: 2048, nullable: true })
  thumbnailUrl!: string | null;

  @Column({ type: 'json' })
  tags!: string[];

  @Column({ type: 'mediumtext', collation: 'utf8mb4_0900_ai_ci', select: false })
  searchText!: string;

  @CreateDateColumn({ type: 'datetime', precision: 6 })
  createdAt!: Date;
}

export function postSearchText(post: Pick<Post, 'title' | 'description' | 'code' | 'tags'>): string {
  return [post.title, post.description, post.code ?? '', ...post.tags].join(' ');
}
