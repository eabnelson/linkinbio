import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import session from 'express-session';
import passport from 'passport';
import RedisStore from 'connect-redis';
import * as Redis from 'ioredis';

import { AppModule } from './app/app.module';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	const redisClient = app.get<Redis.Redis>('REDIS_CLIENT');

	app.enableCors({
		origin: process.env.APP_URI,
		credentials: true
	});

	const sessionStore = new RedisStore({
		client: redisClient
	});

	app.use(
		session({
			store: sessionStore,
			secret: process.env.SESSION_SECRET,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: false
			}
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(
		new SpotifyStrategy(
			{
				clientID: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				callbackURL: process.env.CALLBACK_URL
			},
			function (accessToken, refreshToken, expires_in, profile, done) {
				return done(null, { ...profile, accessToken });
			}
		)
	);

	const port = process.env.PORT ?? 3333;
	const host = process.env.HOST ?? 'localhost';
	await app.listen(port);
	Logger.log(`🚀 Application is running on: http://${host}:${port}`);
}

bootstrap();
