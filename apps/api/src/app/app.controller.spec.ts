import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';

import { AppController } from './app.controller';
import { AppService } from './app.service';

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
						host: process.env.REDIS_HOST_DEV,
						port: Number.parseInt(process.env.REDIS_PORT_DEV)
					})
				}
			]
		}).compile();
	});

	describe('getData', () => {
		it('should return "Welcome to Alma"', () => {
			const appController = app.get<AppController>(AppController);
			expect(appController.getData()).toEqual('Welcome to Alma');
		});
	});
});
