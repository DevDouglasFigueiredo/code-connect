import { createHash, randomBytes, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { Post, postSearchText } from '../posts/post.entity';
import { PostLike } from '../posts/like.entity';
import { PostComment } from '../posts/comment.entity';

const deriveKey = promisify(scrypt);
export function seedId(key: string): string {
  const hex = createHash('sha256').update(`code-connect-demo-v1:${key}`).digest('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export async function seedDatabase(database: DataSource, password: string): Promise<void> {
  if (password.length < 8 || password.length > 128) throw new Error('SEED_PASSWORD must have 8 to 128 characters');
  if (await database.showMigrations()) throw new Error('Apply pending migrations before running the seed');
  await database.transaction(async (manager) => {
    const users = manager.getRepository(User);
    const posts = manager.getRepository(Post);
    const likes = manager.getRepository(PostLike);
    const comments = manager.getRepository(PostComment);
    const names = ['Julio Oliveira', 'Marcia Santos', 'Gabriel Luz'];
    for (let index = 0; index < names.length; index++) {
      const id = seedId(`user-${index}`);
      if (await users.existsBy({ id })) continue;
      const salt = randomBytes(16).toString('hex');
      const passwordHash = await deriveKey(password, salt, 64) as Buffer;
      await users.insert({ id, name: names[index], email: `demo${index + 1}@example.com`, salt, passwordHash });
    }
    const topics = [
      { title: 'Componentes acessíveis com React', tags: ['React', 'Front-end', 'Acessibilidade'] },
      { title: 'Uma API de projetos com NestJS', tags: ['NestJS', 'TypeScript', 'Backend'] },
      { title: 'Layouts responsivos com CSS Grid', tags: ['CSS', 'Front-end', 'Design'] },
      { title: 'Testando aplicações TypeScript', tags: ['TypeScript', 'Testes'] },
      { title: 'Consultas eficientes no MySQL', tags: ['MySQL', 'Backend', 'Banco de dados'] },
      { title: 'Sistema visual para desenvolvedores', tags: ['Design', 'UI', 'React'] },
    ];
    const images = ['photo-1555066931-4365d14bab8c', 'photo-1515879218367-8466d910aaa4', 'photo-1461749280684-dccba630e2f6'];
    for (let index = 0; index < 30; index++) {
      const id = seedId(`post-${index}`);
      // Existing fixtures (and any manual edits to them) are preserved on reruns.
      if (await posts.existsBy({ id })) continue;
      const topic = topics[index % topics.length];
      const post = posts.create({ id, authorId: seedId(`user-${index % names.length}`),
        title: `${topic.title} — projeto ${index + 1}`,
        description: `Compartilhando aprendizados sobre ${topic.tags.join(', ')}. Este projeto demonstra soluções práticas, exemplos e melhorias para a comunidade de desenvolvimento.`,
        code: index % 2 === 0 ? `// Projeto ${index + 1}\nconst greeting = (name: string) => \`Olá, \${name}!\`;` : null,
        thumbnailUrl: index % 3 === 0 ? null : `https://images.unsplash.com/${images[index % images.length]}?auto=format&fit=crop&w=900&q=80`,
        tags: topic.tags, createdAt: new Date(Date.UTC(2026, 9, 1, 12, index)) });
      post.searchText = postSearchText(post);
      await posts.insert(post);
      for (let liker = 0; liker < index % 4; liker++) {
        await likes.insert({ postId: id, userId: seedId(`user-${liker}`) });
      }
      const rootId = seedId(`comment-${index}`);
      await comments.insert({ id: rootId, postId: id, authorId: seedId('user-1'), parentId: null,
        text: 'Gostei do projeto! Como você organizou os componentes?', createdAt: new Date(Date.UTC(2026, 9, 2, 12, index)) });
      await comments.insert({ id: seedId(`reply-${index}`), postId: id, authorId: post.authorId, parentId: rootId,
        text: 'Obrigado! Separei as responsabilidades para facilitar o reaproveitamento.', createdAt: new Date(Date.UTC(2026, 9, 2, 13, index)) });
    }
  });
}
