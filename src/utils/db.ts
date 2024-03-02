import { Surreal } from "surrealdb.js";

export const connectToDB = async (
  url: string,
  username: string,
  password: string,
  namespace: string,
  database: string,
) => {
  const db = new Surreal();
  await db.connect("http://127.0.0.1:8000", {
    namespace,
    database,
    auth: {
      namespace,
      database,
      username,
      password,
    },
  });
  return db;
};
