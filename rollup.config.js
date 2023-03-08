const terser = require('@rollup/plugin-terser');
const commonjs = require('@rollup/plugin-commonjs');

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
				// imported dynamically when in node environment
				// preserving require call
				"worker_threads" 
			]
		})
	]
};
