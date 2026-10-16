import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Post } from './post.entity';
import { PostLike } from './like.entity';
import { PostComment } from './comment.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Post, PostLike, PostComment])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
