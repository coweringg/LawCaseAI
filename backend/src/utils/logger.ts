import pino from "pino";
import pinoHttp from "pino-http";

const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

export const logger = pino({
  level: process.env.LOG_LEVEL || (isTest ? "silent" : "info"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "token",
      "secret",
      "apiKey",
      "creditCard",
    ],
    censor: "[REDACTED]",
  },
  ...(isProduction
    ? {}
    : {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss",
            ignore: "pid,hostname",
          },
        },
      }),
});

export const httpLogger = pinoHttp({
  logger,
  autoLogging: {
    ignore: (req) => {
      return req.url === "/health";
    },
  },
  customSuccessMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customErrorMessage: (req, res) => {
    return `${req.method} ${req.url} ${res.statusCode}`;
  },
  customLogLevel: (_req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      ...(isProduction ? {} : { headers: req.headers }),
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

export default logger;
