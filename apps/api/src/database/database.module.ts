import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseOptions } from './database-options';

@Module({
  imports: [TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: (config: ConfigService) => databaseOptions({
      DB_HOST: config.get<string>('DB_HOST'),
      DB_PORT: config.get<number>('DB_PORT'),
      DB_NAME: config.get<string>('DB_NAME'),
      DB_USER: config.get<string>('DB_USER'),
      DB_PASSWORD: config.get<string>('DB_PASSWORD'),
    }),
  })],
})
export class DatabaseModule {}
