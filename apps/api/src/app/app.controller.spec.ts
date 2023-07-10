import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { apiEnv } from '../environments/environment';

const { redis } = apiEnv;

describe('AppController', () => {
	let app: TestingModule;

	beforeAll(async () => {
		app = await Test.createTestingModule({
			controllers: [AppController],
			providers: [
				AppService,
				{
					provide: 'REDIS_CLIENT',
					useValue: new Redis({
						host: redis.host,
						port: redis.port,
						password: redis.password
					})
				}
			]
		}).compile();
	});

	describe('getData', () => {});
});
