import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

const { combine, timestamp, label, printf } = winston.format;
 
const loggerFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Load env config
const config = require('dotenv').config();

const {
  LOG_LEVEL = 'info',
  LOG_MAX_SIZE = '20m'
} = config.parsed;

export class Logger {

  private logger: winston.Logger;
  
  constructor(name: string = 'services') {
    const filename = `logs/${name}.%DATE%.log`;
    
    this.logger = winston.createLogger({
      format: combine(
        timestamp(),
        loggerFormat
      ),
      transports: [
        new winston.transports.Console({level: 'debug'}),
        new DailyRotateFile({ 
          filename, 
          level: LOG_LEVEL, 
          maxSize: LOG_MAX_SIZE,
          maxFiles: 1
        })
      ]
    });
  }

  debug(message: any) {
    this.logger.debug(message);
  }

  info(message: any) {
    this.logger.info(message);
  }
  
  warn(message: any) {
    this.logger.warn(message);
  }

  error(message: any) {
    this.logger.error(message);
  }

} 