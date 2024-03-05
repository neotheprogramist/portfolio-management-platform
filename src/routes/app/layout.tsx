import { Slot, component$ } from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { Navbar } from "~/components/navbar/navbar";
import { NavbarContent } from "~/components/navbar/navbar-content";

export const onRequest: RequestHandler = ({ json, cookie, env }) => {
  const accessToken = cookie.get("accessToken");
  if (!accessToken) {
    json(401, { message: "Unauthorized - No Access Token" });
    return;
  }
  const secret = env.get("ACCESS_TOKEN_SECRET");
  if (!secret) throw new Error("No secret");
  if (!jwt.verify(accessToken.value, secret)) {
    json(401, { message: "Unauthorized - Token Not Verified" });
    return;
  }
};

export default component$(() => {
  return (
    <>
      <div class="grid h-screen grid-rows-[auto_1fr] bg-black font-['Sora']">
        <Navbar>
          <NavbarContent />
        </Navbar>
        <Slot />
      </div>
    </>
  );
});
