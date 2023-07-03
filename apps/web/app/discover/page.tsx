import { getEpisodeData } from 'apps/web/spotify-data/spotify-api';

export default async function Page() {
	const episodeData = await getEpisodeData();

	return (
		<div>
			<h1>discover</h1>
			<ul>
				{episodeData.map((episode: any, index: number) => (
					<li key={index}>
						<div>
							<a href={episode.link} target="_blank" rel="noopener noreferrer">
								<div>{episode.link}</div>
							</a>
						</div>
					</li>
				))}
			</ul>
		</div>
	);
}
