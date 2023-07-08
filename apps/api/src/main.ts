import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Strategy as SpotifyStrategy } from 'passport-spotify';
import session from 'express-session';
import passport from 'passport';
import RedisStore from 'connect-redis';
import { AppModule } from './app/app.module';
import { apiEnv } from './environments/environment';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as Redis from 'ioredis';
import cors from 'cors';

const { api } = apiEnv;

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule);

	const redisClient = app.get<Redis.Redis>('REDIS_CLIENT');

	app.enable('trust proxy', 1);

	const sessionStore = new RedisStore({
		client: redisClient
	});

	app.use(
		session({
			store: sessionStore,
			secret: api.sessionSecret,
			resave: false,
			saveUninitialized: false,
			cookie: {
				secure: api.isProd ? true : false,
				sameSite: api.isProd ? 'none' : false,
				httpOnly: false,
				domain: api.domain
			}
		})
	);

	app.use(
		cors({
			origin: [api.appUri, 'http://localhost:4200'],
			credentials: true
		})
	);

	app.use(passport.initialize());
	app.use(passport.session());

	passport.use(
		new SpotifyStrategy(
			{
				clientID: api.spotify.clientId,
				clientSecret: api.spotify.clientSecret,
				callbackURL: api.spotify.callbackUrl
			},
			function (accessToken, refreshToken, expires_in, profile, done) {
				return done(null, { ...profile, accessToken });
			}
		)
	);

	const port = api.port;
	const host = api.host;
	await app.listen(port, host);
	Logger.log(`🚀 Application is running on: http://${host}:${port}`);
}

bootstrap().catch(console.log);
