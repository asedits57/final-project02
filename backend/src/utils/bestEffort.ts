import { logger } from "./logger";
import { serializeError } from "./logging";

export const logBestEffortFailure = (message: string, error: unknown) => {
  logger.debug(message, serializeError(error));
};
