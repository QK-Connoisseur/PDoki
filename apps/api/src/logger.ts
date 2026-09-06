import { pino, type DestinationStream, type Logger } from "pino";

export function createLogger(
  level: string,
  destination?: DestinationStream
): Logger {
  const options = {
    level,
    redact: [
      "req.headers.authorization",
      "req.headers.cf-access-jwt-assertion",
      "req.headers.cookie",
      "req.headers.x-csrf-token",
      "req.headers.x-operations-csrf",
    ],
  };
  return destination ? pino(options, destination) : pino(options);
}
