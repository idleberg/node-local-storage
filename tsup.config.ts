import { defineConfig } from 'tsup';

export default defineConfig((options) => {
	const isProduction = options.watch !== true;

	return {
		target: 'node22',
		clean: isProduction,
		dts: isProduction,
		entry: ['src/index.ts'],
		format: ['cjs', 'esm'],
		minify: isProduction,
		treeshake: 'recommended',
	};
});
