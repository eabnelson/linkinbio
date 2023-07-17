import process from 'process';

const isProd = process.env.ALMA_ENV === 'production';

export const apiEnv: IApiEnv = {
	api: {
		isProd: isProd,
		port: isProd ? Number(process.env.PORT) : Number(process.env.ALMA_API_PORT),
		host: isProd ? process.env.ALMA_API_HOST_PROD : process.env.ALMA_API_HOST,
		appUri: isProd ? process.env.ALMA_APP_URL_PROD : process.env.ALMA_APP_URL,
		apiUri: isProd ? process.env.ALMA_API_URL_PROD : process.env.ALMA_API_URL,
		sessionSecret: process.env.SESSION_SECRET,
		domain: isProd ? process.env.ALMA_DOMAIN_PROD : process.env.ALMA_DOMAIN_DEV,
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
		domain: string;
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
}
