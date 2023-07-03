import React from 'react';
import { render } from '@testing-library/react';
import Page from '../app/page';
describe('Page', () => {
	it('should render successfully', async () => {
		const { baseElement } = render((await Page()) as unknown as React.ReactElement);
		expect(baseElement).toBeTruthy();
	});
});
