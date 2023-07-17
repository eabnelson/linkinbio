import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { apiEnv } from './environments/environment';
import { NestExpressApplication } from '@nestjs/platform-express';
import cors from 'cors';

const { api } = apiEnv;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	app.enable('trust proxy', 1);

	app.use(
		cors({
			origin: [api.appUri, 'http://localhost:4200'],
			credentials: true
		})
	);

	const port = api.port;
	const host = api.host;
	await app.listen(port, host);
	Logger.log(`🎧 Application is running on: http://${host}:${port} 🎧`);
}

bootstrap().catch(console.log);
