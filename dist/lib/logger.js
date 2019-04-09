"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const winston = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
const { combine, timestamp, label, printf } = winston.format;
const loggerFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});
const config = require('dotenv').config();
const { LOG_LEVEL = 'info', LOG_MAX_SIZE = '20m' } = config.parsed;
class Logger {
    constructor(name = 'services') {
        const filename = `logs/${name}.%DATE%.log`;
        this.logger = winston.createLogger({
            format: combine(timestamp(), loggerFormat),
            transports: [
                new winston.transports.Console({ level: 'debug' }),
                new DailyRotateFile({
                    filename,
                    level: LOG_LEVEL,
                    maxSize: LOG_MAX_SIZE,
                    maxFiles: 1
                })
            ]
        });
    }
    debug(message) {
        this.logger.debug(message);
    }
    info(message) {
        this.logger.info(message);
    }
    warn(message) {
        this.logger.warn(message);
    }
    error(message) {
        this.logger.error(message);
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map