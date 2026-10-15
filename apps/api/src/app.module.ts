import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { validateConfiguration } from './configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolve(__dirname, '../.env'),
      validate: validateConfiguration,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
