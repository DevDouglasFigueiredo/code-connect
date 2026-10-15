import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { QueryFailedError, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user-response.dto';

const deriveKey = promisify(scrypt);

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}
  // A missing account still performs the same expensive password derivation.
  private readonly dummySalt = randomBytes(16).toString('hex');

  async create(input: CreateUserDto): Promise<UserDto> {
    const salt = randomBytes(16).toString('hex');
    const passwordHash = await deriveKey(input.password, salt, 64) as Buffer;
    const user = this.users.create({ id: randomUUID(), name: input.name, email: input.email, salt, passwordHash });
    try {
      await this.users.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError &&
          (error.driverError as { code?: string }).code === 'ER_DUP_ENTRY') {
        throw new UnprocessableEntityException('Email already registered');
      }
      throw error;
    }
    return this.toPublicUser(user);
  }

  async findById(id: string): Promise<UserDto | undefined> {
    const user = await this.users.findOneBy({ id });
    return user ? this.toPublicUser(user) : undefined;
  }

  async verifyCredentials(email: string, password: string): Promise<UserDto | undefined> {
    const user = await this.users.createQueryBuilder('user')
      .addSelect(['user.salt', 'user.passwordHash'])
      .where('user.email = :email', { email })
      .getOne();
    const hash = await deriveKey(password, user?.salt ?? this.dummySalt, 64) as Buffer;
    if (!user || !timingSafeEqual(hash, user.passwordHash)) return undefined;
    return this.toPublicUser(user);
  }

  private toPublicUser(user: User): UserDto {
    return { id: user.id, name: user.name, email: user.email };
  }
}
