export const webEnv: IWebEnv = {
	isProd: process.env.NEXT_PUBLIC_ALMA_ENV === 'production',
	api: {
		apiUrl: process.env.NEXT_PUBLIC_ALMA_API_URL as string
	}
};

export interface IWebEnv {
	isProd: boolean;
	api: {
		apiUrl: string;
	};
}
