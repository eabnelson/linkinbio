'use client';

import useSWR, { mutate } from 'swr';
import { setCookie, getCookie } from 'cookies-next';
import { webEnv } from '../../environments/environments';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faGithub } from '@fortawesome/free-brands-svg-icons';

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

			<div className="fixed inset-x-0 bottom-0 flex items-center justify-center p-4">
				<a
					href="https://x.com/eabnelson"
					target="_blank"
					rel="noopener noreferrer"
					className="text-lg"
				>
					built by erik <FontAwesomeIcon icon={faXTwitter} />
				</a>
				<a
					href="https://github.com/eabnelson/alma"
					target="_blank"
					rel="noopener noreferrer"
					className="text-secondary ml-6 text-lg"
				>
					how? <FontAwesomeIcon icon={faGithub} />
				</a>
			</div>
		</div>
	);
}
