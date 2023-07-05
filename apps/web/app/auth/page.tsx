'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { webEnv } from '../../environments/environments';

const { api } = webEnv;

async function handleLogin() {
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
}

async function handleLogout() {
	try {
		const response = await fetch(`${api.apiUrl}/logout`, {
			method: 'GET',
			credentials: 'include'
		});

		if (!response.ok) {
			console.error('Error logging out:', response.statusText);
		}

		window.location.reload();
	} catch (error) {
		console.error('Error logging out:', error);
	}
}

async function checkAuthStatus() {
	try {
		const response = await fetch(`${api.apiUrl}/auth/check`, {
			method: 'GET',
			credentials: 'include'
		});

		if (response.ok) {
			const { authenticated } = await response.json();
			return authenticated;
		} else {
			console.error('Error checking authentication status:', response.statusText);
		}
	} catch (error) {
		console.error('Error checking authentication status:', error);
	}
}

export default async function Auth() {
	const authenticated = await checkAuthStatus();

	return (
		<div>
			{authenticated ? (
				<button onClick={handleLogout}>disconnect spotify</button>
			) : (
				<button onClick={handleLogin}>connect your Spotify to get started</button>
			)}
		</div>
	);
}
