import * as process from 'node:process';

export const webEnv: IWebEnv = {
	isProd: process.env.ALMA_ENV === 'production',
	api: {
		apiUrl: process.env.ALMA_API_URL as string
	}
};

export interface IWebEnv {
	isProd: boolean;
	api: {
		apiUrl: string;
	};
}
