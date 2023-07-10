import { Controller, Get, Res, Req, Inject } from '@nestjs/common';
import { Request, Response } from 'express';
import { Session } from 'express-session';
import { AppService } from './app.service';
import { sign, verify } from 'jsonwebtoken';
import { apiEnv } from '../environments/environment';
import Redis from 'ioredis';
import axios from 'axios';

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

			const jwt = sign({ access_token, refresh_token }, api.sessionSecret);

			res.cookie('jwt', jwt, {
				domain: api.domain
			});
			res.redirect(`${api.appUri}/discover`);
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
		const url = 'https://api.spotify.com/v1/me/episodes';

		const authorizationHeader = request.headers['authorization'];
		const token = authorizationHeader.replace('Bearer ', '');
		const decodedToken = verify(token, api.sessionSecret) as { access_token: string };
		const accessToken = decodedToken.access_token;

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
						external_urls: item.episode.external_urls,
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

		const authorizationHeader = request.headers['authorization'];
		const token = authorizationHeader.replace('Bearer ', '');
		const decodedToken = verify(token, api.sessionSecret) as { access_token: string };
		const accessToken = decodedToken.access_token;

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
					episodeId: item.episode.id,
					episodeLink: item.episode.external_urls.spotify,
					episodeImage: item.episode.images[0].url,
					showName: item.episode.show.name,
					episodeName: item.episode.name,
					links: linkMatches.map((link: string) => ({ link }))
				};
			});

			res.json(episodes);
		} catch (error) {
			console.error(error);
			res.status(500).send('Error retrieving episodes');
		}
	}

	@Get('auth/check')
	async checkAuthStatus(@Req() request: SpotifyRequest & { session: SpotifySession }) {
		try {
			const authorizationHeader = request.headers['authorization'];
			if (!authorizationHeader) {
				return {
					authenticated: false
				};
			}
			const token = authorizationHeader.replace('Bearer ', '');
			const decodedToken = verify(token, api.sessionSecret) as { access_token: string };
			const accessToken = decodedToken.access_token;
			if (accessToken) {
				return {
					authenticated: true
				};
			}
		} catch (error) {
			return {
				authenticated: false
			};
		}
	}
}
