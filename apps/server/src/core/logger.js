import { config } from "./config.js";

export const logger = {
  info: (...params) => {
    if (config.NODE_ENV === "test") {
      return;
    }

    console.log(...params);
  },
  error: (...params) => {
    if (config.NODE_ENV === "test") {
      return;
    }

    return console.error(...params);
  },
};
