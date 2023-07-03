import * as process from 'node:process';

export const apiEnv: IApiEnv = {
	isProd: process.env.ALMA_ENV === 'production',
	api: {
		port: Number(process.env.ALMA_API_PORT),
		host: process.env.ALMA_API_HOST,
		appUri: process.env.ALMA_APP_URI,
		sessionSecret: process.env.SESSION_SECRET,
		spotify: {
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			callbackUrl: process.env.CALLBACK_URL
		}
	},
	db: {
		url: process.env.ALMA_DB_URL
	}
};

export interface IApiEnv {
	isProd: boolean;
	api: {
		port: number;
		host: string;
		appUri: string;
		sessionSecret: string;
		spotify: {
			clientId: string;
			clientSecret: string;
			callbackUrl: string;
		};
	};
	db: {
		url: string;
	};
}
