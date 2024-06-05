/**
 *  @param {boolean} useColors - log with colors in the terminal
 *  @param {boolean} useConsole - whether or not to log using the console. Does not affect other output destinations
 * @param {object} customCodes - overwrite or add new codes to the logger
 */

const colors = require('colors');
const fs = require('fs');

const codes = require('./codes.json');

let logBuffer = []; // Buffer to accumulate log entries

async function logToJson(path, { Timestamp, Code, short, msg, logAmount }) {
	const newObject = { Timestamp, Code, short, msg };
	logBuffer.push(newObject);

	// Check if the logBuffer size has reached the logAmount
	if (logBuffer.length >= logAmount) {
		try {
			let jsonData = [];

			// Read existing data from the file
			const existingData = await fs.promises.readFile(path, 'utf8');
			jsonData = JSON.parse(existingData);

			// Concatenate the accumulated logs with the existing data
			jsonData = jsonData.concat(logBuffer);

			// Write the combined logs to the file
			await fs.promises.writeFile(path, JSON.stringify(jsonData), 'utf8');
			console.log(colors.bgWhite('Logs have been saved'));
		} catch (err) {
			console.error(colors.bgRed('Error saving logs:'), err);
		}

		// Clear the logBuffer after writing to the file
		logBuffer = [];
	}
}

class Logger {
	constructor(useColors, useConsole) {
		this.useColors = useColors || true;
		this.useConsole = useConsole || true;
		this.customCodes = {};
		this.useShortOnly = true;
		this.jsonConfig = {
			useJson: true,
			autoCreateJsonFile: true,
			jsonPath: null,
			logAmount: 1,
		};
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

	async logCode({ code, msg }) {
		if (!code)
			throw new Error(
				'Must provide either a custom code, or a http code found on https://developer.mozilla.org/en-US/docs/Web/HTTP/Status'
			);
		if (typeof code !== 'string') {
			code = `${code}`;
		}
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
			console.log(
				colors[color](
					`[${code}] - [${this.createTimeStamp()}] - ${
						foundCode.short
					} | ${msg}`
				)
			);
		} else {
			console.log(
				colors[color](
					`[${code}] - [${this.createTimeStamp()}] - ${foundCode.short} ${
						this.useShortOnly ? '' : ` | ${foundCode.large}`
					}`
				)
			);
		}

		await logToJson({
			Timestamp: `${this.createTimeStamp()}`,
			Code: code,
			short: foundCode.short,
			msg: msg ? msg : null,
			logAmount: this.jsonConfig.logAmount,
		});
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
(async () => {
	await logger.logCode({ code: '701', msg: 'Testing' });
	await logger.logCode({ code: '200', msg: 'Success' });
	await logger.logCode({ code: '400' });
})();

module.exports = logger;
