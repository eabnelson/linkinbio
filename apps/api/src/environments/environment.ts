import process from 'process';

const isProd = process.env.ALMA_ENV === 'production';

export const apiEnv: IApiEnv = {
	api: {
		isProd: isProd,
		port: isProd ? Number(process.env.ALMA_API_PORT_PROD) : Number(process.env.ALMA_API_PORT),
		host: isProd ? process.env.ALMA_API_HOST_PROD : process.env.ALMA_API_HOST,
		appUri: isProd ? process.env.ALMA_APP_URL_PROD : process.env.ALMA_APP_URL,
		apiUri: isProd ? process.env.ALMA_API_URL_PROD : process.env.ALMA_API_URL,
		sessionSecret: process.env.SESSION_SECRET,
		spotify: {
			clientId: process.env.SPOTIFY_CLIENT_ID,
			clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
			state: process.env.SPOTIFY_STATE,
			callbackUrl: isProd
				? process.env.SPOTIFY_REDIRECT_URI_PROD
				: process.env.SPOTIFY_REDIRECT_URI
		}
	},
	db: {
		url: process.env.ALMA_DB_URL
	},
	redis: {
		host: isProd ? process.env.REDIS_HOST_PROD : process.env.REDIS_HOST_DEV,
		port: isProd ? Number(process.env.REDIS_PORT_PROD) : Number(process.env.REDIS_PORT_DEV),
		password: isProd ? process.env.REDIS_PASSWORD_PROD : process.env.REDIS_PASSWORD_DEV
	}
};

export interface IApiEnv {
	api: {
		isProd: boolean;
		port: number;
		host: string;
		appUri: string;
		apiUri: string;
		sessionSecret: string;
		spotify: {
			clientId: string;
			clientSecret: string;
			state: string;
			callbackUrl: string;
		};
	};
	db: {
		url: string;
	};
	redis: {
		host: string;
		port: number;
		password: string;
	};
}
