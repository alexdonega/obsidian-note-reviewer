import pino from 'pino';

export const logger = pino({
  level: import.meta.env.VITE_LOG_LEVEL || 'info',
  browser: {
    asObject: true,
  },
  transport: import.meta.env.DEV ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  } : undefined
});

// Structured logging helpers
export const log = {
  info: (msg: string, data?: object) => logger.info(data, msg),
  warn: (msg: string, data?: object) => logger.warn(data, msg),
  error: (msg: string, error?: Error | unknown, data?: object) => {
    if (error instanceof Error) {
      logger.error({ ...data, error: error.message, stack: error.stack }, msg);
    } else {
      logger.error({ ...data, error }, msg);
    }
  },
  debug: (msg: string, data?: object) => logger.debug(data, msg),
};
