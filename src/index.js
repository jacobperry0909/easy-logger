/**
 *  @param {boolean} useColors - log with colors in the terminal
 *  @param {boolean} useConsole - whether or not to log using the console. Does not affect other output destinations
 * @param {object} customCodes - overwrite or add new codes to the logger
 */
const colors = require('colors');
const codes = require('./codes.json');
class Logger {
	constructor(useColors, useConsole) {
		this.useColors = useColors || true;
		this.useConsole = useConsole || true;
		this.customCodes = {};
	}

	log(msg, color) {
		if (!msg) throw new Error('Must include a msg');
		if (color) {
			console.log(colors[color](msg));
		}
	}

	logCode({ code, msg }) {
		let consoleOutput = '';
		let finalOutput = '';
		if (code && msg) {
		}
	}
	addCustomCode(code, name, msg, color) {
		if (!code || !name || !msg)
			throw new Error('must include a code, name, and msg');
		if (this.useColors && !color)
			throw new Error(
				'Either disable colors, or add a color to your custom code.'
			);

		this.customCodes[code] = { short: name, long: msg, color: color };
	}
}

const logger = new Logger();

logger.log('Testing', 'red');

module.exports = logger;
