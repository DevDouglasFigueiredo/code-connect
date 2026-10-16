import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class CreatePosts1792108800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    // The original users migration inherits the database's charset/collation.
    // Foreign-key strings must match that existing column, even when the connection uses utf8mb4_bin.
    const [userIdColumn] = await queryRunner.query(`SELECT CHARACTER_SET_NAME AS charset, COLLATION_NAME AS collation
      FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'id'`) as { charset: string; collation: string }[];
    if (!userIdColumn || !/^[a-zA-Z0-9_]+$/.test(userIdColumn.charset) || !/^[a-zA-Z0-9_]+$/.test(userIdColumn.collation)) {
      throw new Error('Cannot determine the existing users.id character set');
    }
    const tableOptions = `ENGINE=InnoDB DEFAULT CHARSET=${userIdColumn.charset} COLLATE=${userIdColumn.collation}`;
    await queryRunner.query(`CREATE TABLE posts (
      id char(36) NOT NULL,
      authorId char(36) NOT NULL,
      title varchar(160) NOT NULL,
      description text NOT NULL,
      code mediumtext NULL,
      thumbnailUrl varchar(2048) NULL,
      tags json NOT NULL,
      searchText mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
      createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id),
      INDEX IDX_posts_created (createdAt, id),
      FULLTEXT INDEX IDX_posts_search (searchText),
      CONSTRAINT FK_posts_author FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE
    ) ${tableOptions}`);
    await queryRunner.query(`CREATE TABLE post_likes (
      postId char(36) NOT NULL,
      userId char(36) NOT NULL,
      createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (postId, userId),
      CONSTRAINT FK_likes_post FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT FK_likes_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    ) ${tableOptions}`);
    await queryRunner.query(`CREATE TABLE post_comments (
      id char(36) NOT NULL,
      postId char(36) NOT NULL,
      authorId char(36) NOT NULL,
      parentId char(36) NULL,
      text text NOT NULL,
      createdAt datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
      PRIMARY KEY (id),
      INDEX IDX_comments_page (postId, parentId, createdAt, id),
      CONSTRAINT FK_comments_post FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
      CONSTRAINT FK_comments_author FOREIGN KEY (authorId) REFERENCES users(id) ON DELETE CASCADE,
      CONSTRAINT FK_comments_parent FOREIGN KEY (parentId) REFERENCES post_comments(id) ON DELETE CASCADE
    ) ${tableOptions}`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE post_comments');
    await queryRunner.query('DROP TABLE post_likes');
    await queryRunner.query('DROP TABLE posts');
  }
}
