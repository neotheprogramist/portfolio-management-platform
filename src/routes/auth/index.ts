import { type RequestHandler } from "@builder.io/qwik-city";

import jwt from "jsonwebtoken";
import { SiweMessage, generateNonce } from "siwe";
import { type RawQueryResult } from "surrealdb.js/script/types";
import { type Nonce } from "~/interface/auth/Nonce";
import type RefreshTokenBodyResponse from "~/interface/auth/RefreshTokenBodyResponse";
import type VerifyMessageBodyResponse from "~/interface/auth/VerifyMessageBodyResponse";
import { connectToDB } from "~/utils/db";

const MESSAGE_EXPIRATION_TIME = 60 * 1000;

// GENERATE NONCE
export const onGet: RequestHandler = async ({ request, json, env }) => {
  const db = await connectToDB(
    env.get("SURREALDB_URL") || "http://localhost:8000",
    env.get("SURREALDB_USER") || "root",
    env.get("SURREALDB_PASS") || "root",
    env.get("SURREALDB_NS") || "test",
    env.get("SURREALDB_DB") || "test",
  );

  const address = request.headers.get("X-Address");
  if (!address) {
    json(400, { error: "Invalid address" });
    return;
  }
  try {
    const nonce = generateNonce();
    await db.create<Nonce>(`nonce`, {
      address,
      value: nonce,
      expiration: Date.now() + MESSAGE_EXPIRATION_TIME,
    });
    json(200, { nonce });
  } catch (e) {
    console.error("ERROR", e);
    json(500, { error: "Server error" });
  }
};

// VERIFY MESSAGE
export const onPost: RequestHandler = async ({
  parseBody,
  json,
  cookie,
  env,
}) => {
  const db = await connectToDB(
    env.get("SURREALDB_URL") || "http://localhost:8000",
    env.get("SURREALDB_USER") || "root",
    env.get("SURREALDB_PASS") || "root",
    env.get("SURREALDB_NS") || "test",
    env.get("SURREALDB_DB") || "test",
  );

  const { message, signature } =
    (await parseBody()) as VerifyMessageBodyResponse;
  try {
    const siweMessage = new SiweMessage(message);
    const { address } = siweMessage;
    const queryResult = await db.query(
      `SELECT * FROM nonce WHERE address == type::string($address);`,
      {
        address,
      },
    );

    if (
      !queryResult.length ||
      !queryResult[0] ||
      !Array.isArray(queryResult[0]) ||
      !queryResult[0][0]
    ) {
      json(400, { error: "Invalid nonce" });
      return;
    }

    const result = queryResult[0][0] as Nonce;
    if (result.expiration < Date.now()) {
      await db.query(`DELETE nonce WHERE address = type::string($address);`, {
        address,
      });
      json(400, { error: "Nonce expired" });
      return;
    }

    const isValid = await siweMessage.verify({ signature });
    if (!isValid.success) {
      json(400, { error: "Invalid signature" });
      return;
    }

    const [dbAddress] = await db.query(
      `SELECT * FROM address WHERE value = type::string($address);`,
      { address },
    );

    let addr;
    let userId;
    if (dbAddress !== null && (dbAddress as RawQueryResult[]).length === 0) {
      addr = await db.create("address", { value: address });
      const usr = await db.create(`user`, {});
      await db.query(
        `DEFINE INDEX addressIndex ON TABLE address COLUMNS value UNIQUE;`,
      );
      await db.query(`RELATE ONLY ${addr[0].id}->has_account->${usr[0].id};`);
      userId = usr[0].id;
    } else {
      addr = dbAddress;
      const [acc]: any = await db.query(
        `SELECT ->has_account.out FROM address WHERE value = '${address}'`,
      );
      if (!acc) throw new Error("No account connected to address");
      userId = acc[0]["->has_account"]["out"][0];
    }

    // Generate tokens
    const secret = env.get("ACCESS_TOKEN_SECRET");
    const refreshSecret = env.get("REFRESH_TOKEN_SECRET");
    if (!secret || !refreshSecret) throw new Error("No secret");

    const accessToken = jwt.sign({ userId }, secret, { expiresIn: "1h" });
    cookie.set("accessToken", accessToken);

    const refreshToken = jwt.sign({ userId }, refreshSecret, {
      expiresIn: "6h",
    });

    // Delete nonce
    await db.query(`DELETE nonce WHERE address = type::string($address);`, {
      address,
    });

    json(200, { isValid: isValid.success, refreshToken });
  } catch (e) {
    console.error("ERROR", e);
    json(500, { error: "Server error" });
  }
};

// REFRESH AUTH TOKEN
export const onPatch: RequestHandler = async ({
  parseBody,
  json,
  env,
  cookie,
}) => {
  const { refreshToken } = (await parseBody()) as RefreshTokenBodyResponse;
  if (!refreshToken) {
    json(401, { message: "Unauthorized" });
    return;
  }

  const refreshSecret = env.get("REFRESH_TOKEN_SECRET");
  if (!refreshSecret) throw new Error("No secret");

  const accessTokenSecret = env.get("ACCESS_TOKEN_SECRET");
  if (!accessTokenSecret) throw new Error("No secret");

  try {
    const payload = jwt.verify(refreshToken, refreshSecret) as jwt.JwtPayload;
    const accessToken = jwt.sign(
      { userId: payload.userId },
      accessTokenSecret,
      {
        expiresIn: "1h",
      },
    );
    cookie.set("accessToken", accessToken);

    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      refreshSecret,
      {
        expiresIn: "6h",
      },
    );

    json(200, { refreshToken: newRefreshToken });
  } catch (error) {
    json(401, { message: "Unauthorized" });
  }
};

// LOGOUT
export const onDelete: RequestHandler = async ({ cookie, json }) => {
  try {
    cookie.delete("accessToken");
    json(200, { message: "Logged out successfully" });
  } catch (error) {
    console.error("ERROR", error);
    json(500, { error: "Server error" });
  }
};
