import { Injectable, Logger } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LoggerService extends Logger {
  private readonly logger: winston.Logger;

  constructor() {
    super();

    const logDir =  'logstorage';
    this.ensureDirectoryExists(logDir);

    const dateDir = path.join(logDir, new Date().toISOString().split('T')[0]);
    this.ensureDirectoryExists(dateDir);

    const appName =  'DefaultAppName';
    
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), // UTC timestamp with milliseconds
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp}, ${appName}, ${level.toUpperCase()}, ${message}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          dirname: dateDir,
          filename: '%DATE%.log',
          datePattern: 'YYYY-MM-DD-HH',
          zippedArchive: false,
          maxSize: '20m',
          maxFiles: '14d',
          frequency: '1h',
        }),
      ],
    });
  }

  private ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(message: string,context?: string) {
    const logMessage = context ? `${context}: ${message}` : message;
    super.log(logMessage);
    this.logger.info(logMessage);
  }

  error(message: string, trace: string, context?: string) {
    const logMessage = context ? `${context}: ${message}` : message;
    super.error(logMessage, trace);
    this.logger.error(`${logMessage} \n${trace}`);
  }

  warn(message: string,context?: string) {
    const logMessage = context ? `${context}: ${message}` : message;
    super.warn(logMessage);
    this.logger.warn(logMessage);
  }

  debug(message: string,context?: string) {
    const logMessage = context ? `${context}: ${message}` : message;
    super.debug(logMessage);
    this.logger.debug(logMessage);
  }

  verbose(message: string,context?: string) {
    const logMessage = context ? `${context}: ${message}` : message;
    super.verbose(logMessage);
    this.logger.verbose(logMessage);
  }
}
