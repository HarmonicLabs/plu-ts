const terser = require('@rollup/plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const nodePolyfill = require('rollup-plugin-polyfill-node');

module.exports = {
	input: 'tsc-out/offchain/tx/builder/buildWorker.js',
	output: {
		file: 'src/offchain/tx/builder/rollup-out/buildWorker.js',
		format: 'iife',
		name: "buildWorker"
	},
	external: ['node:worker_threads'],
	plugins: [
		// terser(), // minify
		commonjs(), // changes require paths if moved (as in our case)
		nodeResolve({ // resolve "buffer" dependecy
			preferBuiltins: false, //use known deps
			browser: true,
		})
	]
};
