import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { SiweMessage, generateNonce } from "siwe";
import {
  createNonce,
  deleteExpiredNonces,
  getNonce,
} from "~/interface/auth/nonce";
import type RefreshTokenBodyResponse from "~/interface/auth/RefreshTokenBodyResponse";
import type VerifyMessageBodyResponse from "~/interface/auth/VerifyMessageBodyResponse";
import { createUserIfNotExists } from "~/interface/user";
import { connectToDB } from "~/utils/db";

export const onGet: RequestHandler = async ({ env, json }) => {
  console.log("before connectToDB");
  const db = await connectToDB(env);
  console.log("after connectToDB");

  const deletedNonces = await deleteExpiredNonces(db);
  console.log("Deleted nonces", deletedNonces);
  const nonce = generateNonce();

  const result = await createNonce(db, nonce);

  json(200, { nonce: result.val });
};

export const onPost: RequestHandler = async ({
  parseBody,
  json,
  error,
  cookie,
  env,
}) => {
  const db = await connectToDB(env);

  const { message, signature } =
    (await parseBody()) as VerifyMessageBodyResponse;
  const siweMessage = new SiweMessage(message);

  console.log("before verify");
  const verifiedSiweMessage = await siweMessage.verify({ signature });
  console.log("after verify");
  if (!verifiedSiweMessage.success) {
    error(403, "Invalid signature");
    return;
  }

  const { address, chainId } = verifiedSiweMessage.data;
  const deletedNonces = await deleteExpiredNonces(db);
  console.log("Deleted nonces", deletedNonces);
  const nonce = await getNonce(db, verifiedSiweMessage.data.nonce);
  console.log("Nonce", nonce);
  const userId = await createUserIfNotExists(db, address);
  console.log("User ID", userId);

  const accessTokenSecret = env.get("ACCESS_TOKEN_SECRET");
  const refreshTokenSecret = env.get("REFRESH_TOKEN_SECRET");
  if (!accessTokenSecret || !refreshTokenSecret) {
    const errorMessage = !accessTokenSecret
      ? "Missing ACCESS_TOKEN_SECRET"
      : "" + !refreshTokenSecret
        ? "Missing REFRESH_TOKEN_SECRET"
        : "";
    throw new Error(errorMessage);
  }

  const accessToken = jwt.sign(
    { userId, address, chainId },
    accessTokenSecret,
    {
      expiresIn: "1h",
    },
  );
  const refreshToken = jwt.sign(
    { userId, address, chainId },
    refreshTokenSecret,
    {
      expiresIn: "6h",
    },
  );

  cookie.set("accessToken", accessToken);
  json(200, { refreshToken });
};

export const onPatch: RequestHandler = async ({
  parseBody,
  json,
  error,
  env,
  cookie,
}) => {
  const { refreshToken } = (await parseBody()) as RefreshTokenBodyResponse;
  if (!refreshToken) {
    error(401, "Unauthorized");
    return;
  }

  const accessTokenSecret = env.get("ACCESS_TOKEN_SECRET");
  const refreshTokenSecret = env.get("REFRESH_TOKEN_SECRET");
  if (!accessTokenSecret || !refreshTokenSecret) {
    const errorMessage = !accessTokenSecret
      ? "Missing ACCESS_TOKEN_SECRET"
      : "" + !refreshTokenSecret
        ? "MiREFRESH_TOKEN_SECRET"
        : "";
    throw new Error(errorMessage);
  }

  try {
    const payload = jwt.verify(
      refreshToken,
      refreshTokenSecret,
    ) as jwt.JwtPayload;
    const accessToken = jwt.sign(
      {
        userId: payload.userId,
        address: payload.address,
        chainId: payload.chainId,
      },
      accessTokenSecret,
      {
        expiresIn: "1h",
      },
    );
    cookie.set("accessToken", accessToken);

    const newRefreshToken = jwt.sign(
      { userId: payload.userId },
      refreshTokenSecret,
      {
        expiresIn: "6h",
      },
    );

    json(200, { refreshToken: newRefreshToken });
  } catch (error) {
    json(403, { message: "Unauthorized" });
  }
};

export const onDelete: RequestHandler = async ({ cookie, json }) => {
  cookie.delete("accessToken");
  json(200, { message: "Logged out successfully" });
};
