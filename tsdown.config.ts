import { defineConfig } from 'tsdown';

export default defineConfig((options) => {
	const isProduction = options.watch !== true;

	return {
		target: 'node22',
		dts: isProduction,
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		minify: isProduction,
	};
});
