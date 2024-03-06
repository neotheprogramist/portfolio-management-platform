import { Slot, component$ } from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { Navbar } from "~/components/navbar/navbar";
import { NavbarContent } from "~/components/navbar/navbar-content";

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
      <div class="grid h-screen grid-rows-[auto_1fr] bg-black font-['Sora']">
        <div class="absolute top-0 left-1/4 h-1/5 w-6/12 rounded-full gradient"></div>
        <Navbar>
          <NavbarContent />
        </Navbar>
        <Slot />
        <div class="absolute bottom-0 left-1/4 h-1/5 w-6/12 rounded-full gradient"></div>
      </div>
    </>
  );
});
