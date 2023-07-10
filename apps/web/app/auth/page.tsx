'use client';

import useSWR, { mutate } from 'swr';
import { setCookie, getCookie } from 'cookies-next';
import { webEnv } from '../../environments/environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTwitter } from '@fortawesome/free-brands-svg-icons';

//... other imports

const { api } = webEnv;

const authFetcher = async (url: string) => {
	const jwt = getCookie('jwt');

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
			setCookie('jwt', '', { domain: api.domain });
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
					disconnect{' '}
					<span className="text-green-500" style={{ color: '#1DB954' }}>
						Spotify
					</span>
				</button>
			) : (
				<button onClick={handleLogin}>
					check out links mentioned in your podcasts
					<br />
					connect your{' '}
					<span className="text-green-500" style={{ color: '#1DB954' }}>
						Spotify
					</span>{' '}
					to get started!
				</button>
			)}

			<div className="fixed bottom-0 right-0 p-4 text-blue-500">
				<a href="https://twitter.com/eabnelson" target="_blank" rel="noopener noreferrer">
					reach out to get early access <FontAwesomeIcon icon={faTwitter} />
				</a>{' '}
			</div>
		</div>
	);
}
