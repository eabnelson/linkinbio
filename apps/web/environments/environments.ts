const isProd = process.env.NEXT_PUBLIC_ALMA_ENV === 'production';

export const webEnv: IWebEnv = {
	api: {
		apiUrl: isProd
			? (process.env.NEXT_PUBLIC_ALMA_API_URL_PROD as string)
			: (process.env.NEXT_PUBLIC_ALMA_API_URL as string),
		domain: isProd
			? (process.env.NEXT_PUBLIC_ALMA_DOMAIN_PROD as string)
			: (process.env.NEXT_PUBLIC_ALMA_DOMAIN as string)
	}
};

export interface IWebEnv {
	api: {
		apiUrl: string;
		domain: string;
	};
}
