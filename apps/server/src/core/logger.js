import { env } from "./config.js";

export function info(...params) {
  if (env.NODE_ENV === "test") {
    return;
  }

  console.log(...params);
}

export function error(...params) {
  if (env.NODE_ENV === "test") {
    return;
  }

  return console.error(...params);
}
