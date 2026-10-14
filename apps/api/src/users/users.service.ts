import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user-response.dto';

const deriveKey = promisify(scrypt);
interface StoredUser extends UserDto {
  salt: string;
  passwordHash: Buffer;
}

@Injectable()
export class UsersService {
  private readonly users: StoredUser[] = [];
  // A missing account still performs the same expensive password derivation.
  private readonly dummySalt = randomBytes(16).toString('hex');

  async create(input: CreateUserDto): Promise<UserDto> {
    const salt = randomBytes(16).toString('hex');
    const passwordHash = await deriveKey(input.password, salt, 64) as Buffer;
    // Check after hashing, immediately before insertion, to prevent concurrent duplicates.
    if (this.users.some((user) => user.email === input.email)) {
      throw new UnprocessableEntityException('Email already registered');
    }
    const user: StoredUser = { id: randomUUID(), name: input.name, email: input.email, salt, passwordHash };
    this.users.push(user);
    return this.toPublicUser(user);
  }

  findById(id: string): UserDto | undefined {
    const user = this.users.find((entry) => entry.id === id);
    return user ? this.toPublicUser(user) : undefined;
  }

  async verifyCredentials(email: string, password: string): Promise<UserDto | undefined> {
    const user = this.users.find((entry) => entry.email === email);
    const hash = await deriveKey(password, user?.salt ?? this.dummySalt, 64) as Buffer;
    if (!user || !timingSafeEqual(hash, user.passwordHash)) return undefined;
    return this.toPublicUser(user);
  }

  private toPublicUser(user: StoredUser): UserDto {
    return { id: user.id, name: user.name, email: user.email };
  }
}
