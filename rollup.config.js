import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import {
	terser
} from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss'
import cssModules from 'svelte-preprocess-cssmodules';
import sveltePreprocess from 'svelte-preprocess';
import {
	asMarkupPreprocessor
} from 'svelte-as-markup-preprocessor';
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const tsconfig = require('./tsconfig.json')


const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		async writeBundle() {
			if (server) return;
			server = (await import('child_process')).spawn('yarn', ['start', '--', '--dev'], {
				stdio: ['ignore', 'inherit', 'inherit'],
				shell: true
			});

			process.on('SIGTERM', toExit);
			process.on('exit', toExit);
		}
	};
}

export default {
	onwarn(warning, warn) {
		if (warning.code === 'CIRCULAR_DEPENDENCY') {
			if (warning.message.includes('\\luxon\\')) {
				return;
			}
		}
		if (warning.code === 'THIS_IS_UNDEFINED') { return; }
		warn(warning);
	},
	input: 'src/main.ts',
	output: {
		inlineDynamicImports: true,
		sourcemap: !production,
		format: 'iife',
		name: 'app',
		file: 'App/build/bundle.js'
	},
	plugins: [
		replace({
			preventAssignment: true,
			'ENVIRONMENT': process.env.ENV ?? 'development',
		}),
		svelte({
			preprocess: [
				asMarkupPreprocessor([
					sveltePreprocess({ sourceMap: !production })
				]),
				cssModules(),
			],
			compilerOptions: {
				dev: !production,
				cssHash: ({ hash, css }) => `iKomida-${hash(css)}`
			},
			emitCss: true
		}),
		postcss({
			minimize: true,
			extensions: ['.css'],
			extract: 'bundle.css',
		}),
		resolve({
			browser: true,
			exportConditions: ['browser'],
			dedupe: ['svelte']
		}),
		typescript({
			...tsconfig,
			sourceMap: !production,
			inlineSources: !production
		}),
		commonjs(),
		!production && serve(),
		!production && livereload('App'),
		production && terser({ compress: { ecma: 'ESNext', drop_console: true } })
	],
	watch: {
		clearScreen: false
	}
};