import { drizzle, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { mkdirSync } from "fs";
import { dirname } from "path";

let instance: BetterSQLite3Database<typeof schema> | null = null;

function createDb(): BetterSQLite3Database<typeof schema> {
  const dbPath =
    process.env.DATABASE_URL?.replace("file:", "") ?? "./data/psf.db";
  mkdirSync(dirname(dbPath), { recursive: true });
  const sqlite = new Database(dbPath);
  sqlite.pragma("journal_mode = WAL");
  return drizzle(sqlite, { schema });
}

export const db = new Proxy({} as BetterSQLite3Database<typeof schema>, {
  get(_target, prop, receiver) {
    if (!instance) {
      instance = createDb();
    }
    return Reflect.get(instance, prop, receiver);
  },
});
