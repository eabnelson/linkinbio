import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Redis from 'ioredis';

import { apiEnv } from '../environments/environment';

const { redis } = apiEnv;

@Module({
	imports: [],
	controllers: [AppController],
	providers: [
		AppService,
		{
			provide: 'REDIS_CLIENT',
			useValue: new Redis({
				host: redis.host,
				port: Number.parseInt(redis.port)
			})
		}
	]
})
export class AppModule {}
