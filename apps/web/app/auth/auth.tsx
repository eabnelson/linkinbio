'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webEnv } from 'apps/web/environments/environments';

const { api } = webEnv;

const Auth = () => {
	const [authenticated, setAuthenticated] = useState(false);

	useEffect(() => {
		checkAuthStatus();
	}, []);

	const checkAuthStatus = async () => {
		try {
			const response = await fetch(`${api.apiUrl}/auth/check`, {
				method: 'GET',
				credentials: 'include'
			});

			if (response.ok) {
				const { authenticated } = await response.json();
				setAuthenticated(authenticated);
			} else {
				console.error('Error checking authentication status:', response.statusText);
			}
		} catch (error) {
			console.error('Error checking authentication status:', error);
		}
	};

	const handleLogin = async () => {
		try {
			const response = await fetch(`${api.apiUrl}/auth/spotify`, {
				method: 'GET',
				credentials: 'include'
			});

			const { url: authorizationUrl } = await response.json();

			window.location.href = authorizationUrl;
		} catch (error) {
			console.error('Error logging in with Spotify:', error);
		}
	};

	const handleLogout = async () => {
		try {
			const response = await fetch(`${api.apiUrl}/logout`);

			if (response.ok) {
				setAuthenticated(false);

				useRouter().push('/');
			} else {
				console.error('Error logging out:', response.statusText);
			}
		} catch (error) {
			console.error('Error logging out:', error);
		}
	};

	return (
		<div>
			{authenticated ? (
				<button onClick={handleLogout}>disconnect spotify</button>
			) : (
				<button onClick={handleLogin}>connect your Spotify to get started</button>
			)}
		</div>
	);
};

export default Auth;
