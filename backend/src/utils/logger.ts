import { createLogger, format, transports } from "winston";

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `[${timestamp}] ${level}: ${message}`;
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  return msg;
});

export const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    customFormat
  ),
  transports: [
    new transports.Console(),
    // Uncomment for actual file logging locally!
    // new transports.File({ filename: "logs/error.log", level: "error" }),
    // new transports.File({ filename: "logs/combined.log" }),
  ],
});
