const terser = require('@rollup/plugin-terser');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');

module.exports = {
	input: 'tsc-out/offchain/tx/builder/buildWorker.js',
	output: {
		file: 'src/offchain/tx/builder/rollup-out/buildWorker.js',
		format: 'iife',
		name: "buildWorker",
	},
	plugins: [
		terser(), // minify,
		commonjs({
			ignore :[
				"node:worker_threads"
			]
		})
	]
};
