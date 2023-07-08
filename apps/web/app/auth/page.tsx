'use client';

import useSWR, { mutate } from 'swr';
import Cookies from 'js-cookie';
import { webEnv } from '../../environments/environments';

const { api } = webEnv;

const authFetcher = async (url: string) => {
	const jwt = Cookies.get('jwt');

	const response = await fetch(url, {
		method: 'GET',
		credentials: 'include',
		...(jwt && { headers: { Authorization: `Bearer ${jwt}` } })
	});
	const data = await response.json();
	return data;
};

export default function Auth() {
	const handleLogin = async () => {
		try {
			const { url } = await authFetcher(`${api.apiUrl}/auth/spotify`);
			window.location.href = url;
		} catch (error) {
			console.error('Error logging in with Spotify:', error);
		}
	};

	const handleLogout = async () => {
		try {
			Cookies.remove('jwt');
			mutate(`${api.apiUrl}/auth/check`);
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	const { data, error } = useSWR(`${api.apiUrl}/auth/check`, authFetcher);

	if (error) {
		console.error('Error checking authentication status:', error);
	}

	return (
		<div className="text-center">
			{data?.authenticated ? (
				<button onClick={handleLogout}>
					disconnect <span className="text-green-500">Spotify</span>
				</button>
			) : (
				<button onClick={handleLogin}>
					connect your <span className="text-green-500">Spotify</span> to get started
				</button>
			)}
		</div>
	);
}
