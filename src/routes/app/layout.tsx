import { Slot, component$ } from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { Navbar } from "~/components/navbar/navbar";

export const onRequest: RequestHandler = ({ json, cookie, env }) => {
  const accessToken = cookie.get("accessToken");
  if (!accessToken) {
    json(401, { message: "Unauthorized" });
    return;
  }
  const secret = env.get("ACCESS_TOKEN_SECRET");
  if (!secret) throw new Error("No secret");
  if (!jwt.verify(accessToken.value, secret)) {
    json(401, { message: "Unauthorized" });
    return;
  }
};

export default component$(() => {
  return (
    <>
      <main class="grid h-screen grid-rows-[64px_1fr] bg-black font-['Sora']">
        <Navbar />
        <Slot />
      </main>
    </>
  );
});
