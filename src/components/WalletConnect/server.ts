import jwt from "jsonwebtoken";
import { SiweMessage, generateNonce } from "siwe";
import { server$, z } from "@builder.io/qwik-city";
import { connectToDB } from "~/utils/db";
import {
  createNonce,
  deleteExpiredNonces,
  getNonce,
} from "~/interface/auth/nonce";
import { createUserIfNotExists } from "~/interface/user";

export const getNonceServer = server$(async function () {
  const db = await connectToDB(this.env);
  await deleteExpiredNonces(db);
  const nonce = generateNonce();
  const result = await createNonce(db, nonce);
  return { nonce: result.val };
});

export const verifyMessageServer = server$(async function (
  message: string,
  signature: string,
) {
  const db = await connectToDB(this.env);

  const siweMessage = new SiweMessage(message);
  await deleteExpiredNonces(db);
  const nonce = await getNonce(db, siweMessage.nonce);
  if (!nonce.at(0)) throw new Error("Nonce not found");
  const verifiedSiweMessage = await siweMessage.verify({ signature });
  if (!verifiedSiweMessage.success) {
    throw Error("Invalid signature");
  }

  const { address, chainId } = verifiedSiweMessage.data;
  const userId = await createUserIfNotExists(db, address);

  const accessTokenSecret = this.env.get("ACCESS_TOKEN_SECRET");
  const refreshTokenSecret = this.env.get("REFRESH_TOKEN_SECRET");
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
  const refreshToken: string = jwt.sign(
    { userId, address, chainId },
    refreshTokenSecret,
    {
      expiresIn: "6h",
    },
  );

  this.cookie.set("accessToken", accessToken, { path: "/app" });
  return { refreshToken };
});

export const getSessionServer = server$(async function () {
  const secret = this.env.get("ACCESS_TOKEN_SECRET");
  const accessToken = this.cookie.get("accessToken");
  if (!secret || !accessToken) {
    throw new Error("Missing secret or access token");
  }
  const tokenValidator = z.object({ address: z.string(), chainId: z.number() });
  const token = jwt.verify(accessToken.value, secret);
  const result = tokenValidator.parse(token);
  return { address: result.address, chainId: result.chainId };
});

export const signOutServer = server$(async function () {
  this.cookie.delete("accessToken");
});
