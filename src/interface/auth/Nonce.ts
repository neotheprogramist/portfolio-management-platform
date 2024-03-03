import { type Surreal } from "surrealdb.js";
import { z } from "@builder.io/qwik-city";

export const CreateNonceResult = z.object({
  id: z.string(),
  iat: z.string().datetime(),
  exp: z.string().datetime(),
  val: z.string(),
});
export type CreateNonceResult = z.infer<typeof CreateNonceResult>;
export const createNonce = async (db: Surreal, val: string) => {
  const queryResult = (
    await db.query("CREATE ONLY nonce SET val = type::string($val)", { val })
  ).at(0);
  console.log("Created nonce", queryResult);
  return CreateNonceResult.parse(queryResult);
};

export const GetNonceResult = z.object({
  id: z.string(),
  val: z.string(),
});
export type GetNonceResult = z.infer<typeof GetNonceResult>;
export const getNonce = async (db: Surreal, val: string) => {
  const queryResult = (
    await db.query(
      "SELECT id, val FROM nonce WHERE val == type::string($val)",
      {
        val,
      },
    )
  ).at(0);
  console.log("Got nonce", queryResult);
  return GetNonceResult.array().parse(queryResult);
};

export const DeleteNonceResult = z.object({
  id: z.string(),
  iat: z.string().datetime(),
  exp: z.string().datetime(),
  val: z.string(),
});
export type DeleteNonceResult = z.infer<typeof DeleteNonceResult>;
export const deleteNonce = async (db: Surreal, id: string) => {
  return DeleteNonceResult.parse(
    await db.query(
      "DELETE ONLY nonce WHERE id == type::string($id) RETURN BEFORE",
      {
        id,
      },
    ),
  );
};

export const DeleteExpiredNoncesResult = z.object({
  id: z.string(),
  iat: z.string().datetime(),
  exp: z.string().datetime(),
  val: z.string(),
});
export type DeleteExpiredNoncesResult = z.infer<
  typeof DeleteExpiredNoncesResult
>;
export const deleteExpiredNonces = async (db: Surreal) => {
  const queryResult = (
    await db.query("DELETE nonce WHERE exp < time::now() RETURN BEFORE")
  ).at(0);
  console.log("Deleted expired nonces", queryResult);
  return DeleteExpiredNoncesResult.array().parse(queryResult);
};
