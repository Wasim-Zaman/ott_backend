const morgan = require('morgan');
const { createLogger, format, transports } = require('winston');

// Morgan logger setup for HTTP request logging (console only)
const httpLogger = {
  consoleLogger: morgan('dev'), // 'dev' format for concise colored output
};

// Winston logger setup for application logging (console only)
const appLogger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new transports.Console()],
});

module.exports = {
  httpLogger,
  appLogger,
};
