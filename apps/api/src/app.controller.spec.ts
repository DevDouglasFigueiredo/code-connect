import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  it('returns the greeting', async () => {
    const module = await Test.createTestingModule({ controllers: [AppController], providers: [AppService] }).compile();
    expect(module.get(AppController).getHello()).toBe('Hello World!');
  });
});
