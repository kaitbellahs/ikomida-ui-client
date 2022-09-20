import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import {
	terser
} from 'rollup-plugin-terser';
import css from 'rollup-plugin-css-only';
import cssModules from 'svelte-preprocess-cssmodules';
import sveltePreprocess from 'svelte-preprocess';
import {
	asMarkupPreprocessor
} from 'svelte-as-markup-preprocessor';
import replace from "@rollup/plugin-replace";
import typescript from '@rollup/plugin-typescript';
// import obfuscatorPlugin from 'rollup-plugin-javascript-obfuscator';

const production = !process.env.ROLLUP_WATCH;

function serve() {
	let server;

	function toExit() {
		if (server) server.kill(0);
	}

	return {
		writeBundle() {
			if (server) return;
			server = require('child_process').spawn('yarn', ['start', '--', '--dev'], {
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
		// if (warning.code === 'THIS_IS_UNDEFINED') { return; }
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
			isProduction: process.env.ENV === 'prod',
		}),
		svelte({
			preprocess: [
				// obfuscatorPlugin({
				// 	compact: true,
				// 	controlFlowFlattening: true,
				// 	deadCodeInjection: true,
				// 	debugProtection: true,
				// 	identifierNamesGenerator: 'mangled-shuffled',
				// 	log: false,
				// 	numbersToExpressions: true,
				// 	optionsPreset: 'medium-obfuscation',
				// }),
				asMarkupPreprocessor([
					sveltePreprocess({ sourceMap: !production })
				]),
				cssModules(),
			],
			compilerOptions: {
				// enable run-time checks when not in production
				dev: !production
			}
		}),
		// we'll extract any component CSS out into
		// a separate file - better for performance
		css({
			output: 'bundle.css'
		}),

		// If you have external dependencies installed from
		// npm, you'll most likely need these plugins. In
		// some cases you'll need additional configuration -
		// consult the documentation for details:
		// https://github.com/rollup/plugins/tree/master/packages/commonjs
		resolve({
			browser: true,
			exportConditions: ['browser'],
			dedupe: ['svelte']
		}),
		commonjs(),
		typescript({
			sourceMap: !production,
			inlineSources: !production
		}),

		// In dev mode, call `npm run start` once
		// the bundle has been generated
		!production && serve(),

		// Watch the `public` directory and refresh the
		// browser on changes when not in production
		!production && livereload('public'),

		// If we're building for production (npm run build
		// instead of npm run dev), minify
		production && terser()
	],
	watch: {
		clearScreen: false
	}
};