const { createGlobPatternsForDependencies } = require('@nrwl/react/tailwind');
const { join } = require('node:path');

module.exports = {
	content: [
		join(__dirname, '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'),
		...createGlobPatternsForDependencies(__dirname)
	],
	theme: {
		extend: {
			colors: {
				primary: '#00334e',
				text: '#e8e8e8',
				black: '#262217',
				beigeLight: '#FFFDF8',
				gray: {
					100: '#EAE9E8',
					200: '#D4D3D1',
					300: '#BEBDBA',
					400: '#A8A7A2',
					500: '#93918B',
					600: '#7D7A74',
					700: '#68655D',
					800: '#514E45',
					900: '#3C392F'
				}
			},
			maxWidth: {
				'custom-truncate': '200px'
			}
		}
	},
	plugins: []
};
