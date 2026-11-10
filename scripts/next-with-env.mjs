import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const [envFile, ...nextArgs] = process.argv.slice(2);

if (!envFile || nextArgs.length === 0) {
  throw new Error("Usage: node scripts/next-with-env.mjs <env-file> <next-command>");
}

if (typeof process.loadEnvFile !== "function") {
  throw new Error("Loading env files requires Node.js 20.12.0 or later.");
}

process.loadEnvFile(resolve(process.cwd(), envFile));

const nextBin = fileURLToPath(new URL("../node_modules/next/dist/bin/next", import.meta.url));
process.argv = [process.execPath, nextBin, ...nextArgs];
await import(pathToFileURL(nextBin).href);
