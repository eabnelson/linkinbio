import { fetchEpisodes } from 'apps/web/spotify-data/spotify-api';

export default async function Page() {
	const episodes = await fetchEpisodes();

	return (
		<div>
			<h1>your episodes</h1>
			<ul>
				{episodes.map((episode: any) => (
					<li key={episode.episode.id}>
						<div>{episode.episode.name}</div>
						<div>{episode.episode.show.name}</div>
					</li>
				))}
			</ul>
		</div>
	);
}
