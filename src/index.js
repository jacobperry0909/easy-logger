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
		this.useShortOnly = true;
	}

	createTimeStamp() {
		const now = new Date();
		const month = String(now.getMonth() + 1).padStart(2, '0');
		const day = String(now.getDate()).padStart(2, '0');
		const year = now.getFullYear();
		const hour = String(now.getHours()).padStart(2, '0');
		const minute = String(now.getMinutes()).padStart(2, '0');
		const second = String(now.getSeconds()).padStart(2, '0');

		return `${month}/${day}/${year} ${hour}:${minute}:${second}`;
	}

	log(msg, color) {
		if (!msg) throw new Error('Must include a msg');
		if (color) {
			console.log(colors[color](msg));
		}
	}

	logCode({ code, msg }) {
		if (!code)
			throw new Error(
				'Must provide either a custom code, or a http code found on https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'
			);
		if (typeof code !== 'string') {
			code = `${code}`;
		}
		let finalOutput = '';
		let color;
		let foundCode;
		for (const key in this.customCodes) {
			if (key === code) {
				foundCode = this.customCodes[key];
				color = this.customCodes[key].conf_Color;
			}
		}
		if (!foundCode) {
			for (const key in codes) {
				if (key === code) {
					foundCode = codes[key];
					color = codes[`${key.charAt(0)}xx`].conf_Color;
				}
			}
		}

		if (msg) {
			console.log(colors[color](`[${code}] - ${foundCode.short} | ${msg}`));
		} else {
			console.log(
				colors[color](
					`[${code}] - [${this.createTimeStamp()}] - ${foundCode.short} ${
						this.useShortOnly ? '' : ` | ${foundCode.large}`
					}`
				)
			);
		}
	}
	addCustomCode(code, name, msg, color) {
		if (!code || !name || !msg)
			throw new Error('must include a code, name, and msg');
		if (this.useColors && !color)
			throw new Error(
				'Either disable colors, or add a color to your custom code.'
			);

		this.customCodes[code] = { short: name, large: msg, conf_Color: color };
	}
}

const logger = new Logger();

// testing ↴

logger.addCustomCode('701', 'test', 'testing', 'blue');
logger.logCode({ code: '701', msg: 'Testing' });
logger.logCode({ code: '200', msg: 'Success' });
logger.logCode({ code: '400' });

module.exports = logger;
