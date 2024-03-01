import { Surreal } from "surrealdb.js";

export const connectToDB = async () => {
  const db = new Surreal();
  await db.connect("http://127.0.0.1:8000", {
    namespace: "test",
    database: "test",
    auth: {
      namespace: "test",
      database: "test",
      username: "root",
      password: "root",
    },
  });
  return db;
};
