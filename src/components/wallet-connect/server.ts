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
  const deletedNonces = await deleteExpiredNonces(db);
  console.log("Deleted nonces", deletedNonces);
  const nonce = generateNonce();
  const result = await createNonce(db, nonce);
  return { nonce: result.val };
});

export const verifyMessageServer = server$(async function (
  message: string,
  signature: string,
) {
  console.log("before connectToDB");
  const db = await connectToDB(this.env);
  console.log("after connectToDB");

  const siweMessage = new SiweMessage(message);

  console.log("before verify");
  const verifiedSiweMessage = await siweMessage.verify({ signature });
  console.log("after verify");
  if (!verifiedSiweMessage.success) {
    throw Error("Invalid signature");
  }

  const { address, chainId } = verifiedSiweMessage.data;
  const deletedNonces = await deleteExpiredNonces(db);
  console.log("Deleted nonces", deletedNonces);
  const nonce = await getNonce(db, verifiedSiweMessage.data.nonce);
  console.log("Nonce", nonce);
  const userId = await createUserIfNotExists(db, address);
  console.log("User ID", userId);

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

  this.cookie.set("accessToken", accessToken);
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
  console.log(token);
  const result = tokenValidator.parse(token);
  console.log("Decoded Token", result);
  return { address: result.address, chainId: result.chainId };
});

export const signOutServer = server$(async function () {
  this.cookie.delete("accessToken");
});
