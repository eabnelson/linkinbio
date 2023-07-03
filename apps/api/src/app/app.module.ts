import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import Redis from 'ioredis';

@Module({
	imports: [],
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
})
export class AppModule {}
