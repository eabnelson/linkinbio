'use client';

import { webEnv } from '../../environments/environments';
import Auth from '../auth/page';
import useSWR from 'swr';
import { useState } from 'react';
import { getCookie } from 'cookies-next';

const { api } = webEnv;

const fetchEpisodeData = async (url: string) => {
	const jwt = getCookie('jwt');

	if (!jwt) {
		console.error('No JWT found in cookies');
		return { status: 401, episodes: [] };
	}

	const response = await fetch(url, {
		method: 'GET',
		credentials: 'include',
		headers: {
			Authorization: `Bearer ${jwt}`
		}
	});

	if (response.status === 401) {
		return {
			status: response.status,
			episodes: []
		};
	}

	const data = await response.json();

	return {
		status: response.status,
		episodes: [...data]
	};
};

export default function Page() {
	const [selectedEpisode, setSelectedEpisode] = useState(null);
	const handleToggleLinks = (episodeId: any) => {
		setSelectedEpisode((prevEpisodeId: any) =>
			prevEpisodeId === episodeId ? null : episodeId
		);
	};
	const { data, error } = useSWR(`${api.apiUrl}/discover`, fetchEpisodeData);

	if (!data)
		return (
			<div className="text-center">
				<div className="flex h-screen items-center justify-center">
					<div className="mr-2 animate-spin">🎧</div>
					<h1>loading episodes</h1>
					<div className="ml-2 animate-spin">🎧</div>
				</div>
			</div>
		);

	if (data.status === 401 || data.status === 500) return <Auth />;

	if (error) return <div>an error has occurred.</div>;

	const { episodes } = data;

	return (
		<div className="flex justify-center">
			<ul className="text-center">
				{episodes.map((episode: any) => {
					if (episode.links.length === 0) {
						return null; // Skip the episode if the links array is empty
					}

					return (
						<li key={episode.episodeId} className="mb-4">
							<div className="flex items-center">
								{episode.episodeImage && (
									<img
										src={episode.episodeImage}
										alt={episode.episodeName}
										className="mr-2 h-20 w-auto"
									/>
								)}
								<div className="text-left">
									<div className="text-lg">
										<span>{episode.episodeName}</span>
									</div>
									<div className="text-sm font-bold italic">
										{episode.showName}
									</div>
									<div className="flex items-center">
										<button
											onClick={() => handleToggleLinks(episode.episodeId)}
											className="mr-2 text-blue-500"
										>
											browse episode
										</button>
										<span>|</span>
										<a
											href={episode.episodeLink}
											rel="noopener noreferrer"
											className="flex items-center"
										>
											<span
												className="ml-2 mr-2 text-green-500"
												style={{ color: '#1DB954' }}
											>
												listen on Spotify
											</span>
										</a>
									</div>
								</div>
							</div>
							<div className="text-left">
								{selectedEpisode === episode.episodeId && (
									<ul className="custom-truncate pl-4">
										{episode.links.map((link: any) => (
											<li key={link.link}>
												<a
													href={link.link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-blue-500"
												>
													{link.link}
												</a>
											</li>
										))}
									</ul>
								)}
							</div>
						</li>
					);
				})}
			</ul>
		</div>
	);
}
