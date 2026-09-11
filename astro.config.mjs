// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

import wikiLinkPlugin from 'remark-wiki-link';

// https://astro.build/config
const repo = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : '';
const owner = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[0] : '';
const isUserPage = repo && owner ? repo.toLowerCase() === `${owner.toLowerCase()}.github.io` : false;

export default defineConfig({
	site: owner ? `https://${owner}.github.io` : 'https://example.com',
	base: repo && !isUserPage ? `/${repo}/` : '/',
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [
			[
				wikiLinkPlugin,
				{
					pathFormat: 'raw',
					hrefTemplate: (permalink) => `/wiki/${permalink}`,
					pageResolver: (name) => [name.replace(/ /g, '-')],
				},
			],
		],
	},
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
