import { Test } from '@nestjs/testing';
import Redis from 'ioredis';

import { AppService } from './app.service';

import { apiEnv } from '../environments/environment';

const { redis } = apiEnv;

describe('AppService', () => {
	let service: AppService;

	beforeAll(async () => {
		const app = await Test.createTestingModule({
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

		service = app.get<AppService>(AppService);
	});

	describe('getData', () => {
		it('should return "Welcome to Alma"', () => {
			expect(service.getData()).toEqual('Welcome to Alma');
		});
	});
});
