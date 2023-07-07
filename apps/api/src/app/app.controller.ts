import { Controller, Get, Res, Req, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { Session } from 'express-session';
import Redis from 'ioredis';
import axios from 'axios';

import { AppService } from './app.service';

import { apiEnv } from '../environments/environment';

const { api } = apiEnv;

interface SpotifyRequest extends Request {
	query: {
		code: string;
	};
}

interface SpotifyResponse extends Response {
	session: {
		accessToken?: string;
		refreshToken?: string;
		userId?: string;
		save: () => void;
	};
}

interface SpotifySession extends Session {
	accessToken?: string;
	refreshToken?: string;
	userId?: string;
}

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		@Inject('REDIS_CLIENT') private readonly redisClient: Redis
	) {}

	private parseLinksFromDescription(description: string): string[] {
		const urlRegex = /(https?:\/\/\S+)/g;
		const matches = description.match(urlRegex);

		const links = matches?.map((match) => match.replace(/"$/, '')) ?? [];

		return links;
	}

	@Get()
	getData() {
		return this.appService.getData();
	}

	@Get('auth/spotify')
	spotifyAuth(@Res() res: Response) {
		const clientId = api.spotify.clientId;
		const redirectUri = api.spotify.callbackUrl;
		const scopes = [
			'user-read-recently-played',
			'user-library-read',
			'user-read-playback-position'
		];

		const state = api.spotify.state;

		const queryParameters = new URLSearchParams({
			response_type: 'code',
			client_id: clientId,
			redirect_uri: redirectUri,
			scope: scopes.join(' '),
			state
		}).toString();

		const authorizationUrl = `https://accounts.spotify.com/authorize?${queryParameters}`;

		res.json({ url: authorizationUrl });
	}

	@Get('auth/spotify/callback')
	async spotifyAuthCallback(
		@Req() request: SpotifyRequest & { session: SpotifySession },
		@Res() res: SpotifyResponse
	) {
		const code = request.query.code;

		const clientId = api.spotify.clientId;
		const clientSecret = api.spotify.clientSecret;
		const redirectUri = api.spotify.callbackUrl;

		// Exchange the authorization code for tokens
		try {
			const response = await axios.post(
				'https://accounts.spotify.com/api/token',
				new URLSearchParams({
					grant_type: 'authorization_code',
					code,
					redirect_uri: redirectUri,
					client_id: clientId,
					client_secret: clientSecret
				}).toString(),
				{
					headers: {
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				}
			);

			const { access_token, refresh_token } = response.data;

			const userResponse = await axios.get('https://api.spotify.com/v1/me', {
				headers: {
					Authorization: `Bearer ${access_token}`
				}
			});

			const userId = userResponse.data.id;

			// Store the access_token and refresh_token in the session
			request.session.accessToken = access_token;
			request.session.refreshToken = refresh_token;
			request.session.userId = userId;

			await this.redisClient.set(`user:${userId}`, access_token);

			res.cookie('sessionData', JSON.stringify(request.session));
			res.redirect(`${api.appUri}/episodes`);
		} catch (error) {
			console.error(error);
			res.status(500).send('Error exchanging authorization code for tokens');
		}
	}

	@Get('episodes')
	async getUserEpisodes(
		@Req() request: SpotifyRequest & { session: SpotifySession },
		@Res() res: SpotifyResponse
	) {
		res.header('Access-Control-Allow-Credentials', 'true');
		const url = 'https://api.spotify.com/v1/me/episodes';
		const userId = request.session.userId;

		if (!userId) console.error('No user id found', JSON.stringify(request.session, null, 2));

		const accessToken = await this.redisClient.get(`user:${userId}`);

		if (!accessToken)
			console.error('No accessToken found', JSON.stringify(request.session, null, 2));

		if (!accessToken) {
			return res.status(401).send('Unauthorized');
		}

		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});
			const episodes = response.data.items.map((item) => {
				return {
					added_at: item.added_at,
					episode: {
						description: item.episode.description,
						duration_ms: item.episode.duration_ms,
						html_description: item.episode.html_description,
						href: item.episode.href,
						id: item.episode.id,
						images: item.episode.images,
						name: item.episode.name,
						release_date: item.episode.release_date,
						resume_point: item.episode.resume_point,
						show: {
							description: item.episode.show.description,
							href: item.episode.show.href,
							html_description: item.episode.show.html_description,
							id: item.episode.show.id,
							images: item.episode.show.images,
							name: item.episode.show.name,
							publisher: item.episode.show.publisher,
							total_episodes: item.episode.show.total_episodes,
							type: item.episode.show.type,
							uri: item.episode.show.uri
						},
						type: item.episode.type,
						uri: item.episode.uri
					}
				};
			});

			res.json(episodes);
		} catch (error) {
			console.error(error);
			res.status(500).send('Error retrieving episodes');
		}
	}

	@Get('discover')
	async getEpisodeContent(
		@Req() request: SpotifyRequest & { session: SpotifySession },
		@Res() res: SpotifyResponse
	) {
		const url = 'https://api.spotify.com/v1/me/episodes';

		const userId = request.session.userId;
		const accessToken = await this.redisClient.get(`user:${userId}`);
		if (!accessToken) {
			return res.status(401).send('Unauthorized');
		}

		try {
			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			});

			const episodes = response.data.items.flatMap((item: any) => {
				const description = item.episode.html_description;
				const linkMatches = this.parseLinksFromDescription(description);

				return {
					showName: item.episode.name,
					links: linkMatches.map((link: string) => ({ link }))
				};
			});

			res.json(episodes);
		} catch (error) {
			console.error(error);
			res.status(500).send('Error retrieving episodes');
		}
	}

	@Get('logout')
	async logout(
		@Req() request: SpotifyRequest & { session: SpotifySession },
		@Res() res: Response
	) {
		const userId = request.session.userId;
		const accessToken = await this.redisClient.get(`user:${userId}`);

		if (accessToken) {
			await this.redisClient.del(`user:${userId}`);
		}

		if (userId) {
			request.session.destroy((error) => {
				if (error) {
					console.error('Error logging out:', error);
					return res.status(500).send('Error logging out');
				}
			});
		}

		res.status(200).json({ authenticated: false });
	}

	@Get('auth/check')
	async checkAuthStatus(@Req() request: SpotifyRequest & { session: SpotifySession }) {
		const userId = request.session.userId;
		const accessToken = await this.redisClient.get(`user:${userId}`);

		if (userId && accessToken) {
			return {
				authenticated: true
			};
		} else {
			return {
				authenticated: false
			};
		}
	}
}
