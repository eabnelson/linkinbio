import { Test } from '@nestjs/testing';
import Redis from 'ioredis';

import { AppService } from './app.service';

describe('AppService', () => {
	let service: AppService;

	beforeAll(async () => {
		const app = await Test.createTestingModule({
			providers: [
				AppService,
				{
					provide: 'REDIS_CLIENT',
					useValue: new Redis({
						host: process.env.REDIS_HOST_DEV,
						port: Number.parseInt(process.env.REDIS_PORT_DEV)
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
