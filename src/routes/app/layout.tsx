import {
  Slot,
  component$,
  createContextId,
  useContext,
  useContextProvider,
  useStore,
} from "@builder.io/qwik";
import { type RequestHandler } from "@builder.io/qwik-city";
import jwt from "jsonwebtoken";
import { Message } from "~/components/message/Message";
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
interface Message {
  variant: "info" | "success" | "error" | "";
  message: string;
  isVisible: boolean;
  id: number;
}
interface MessagesStore {
  messages: Message[];
}

export const messagesContext = createContextId<MessagesStore>("Messages");

export default component$(() => {
  useContextProvider(
    messagesContext,
    useStore<MessagesStore>({
      messages: [],
    }),
  );
  const messagesProvider = useContext(messagesContext);
  return (
    <>
      <div class="relative z-0 grid h-screen grid-rows-[auto_1fr] bg-black font-['Sora']">
        <div class="gradient absolute left-1/4 top-0 h-1/5 w-6/12 rounded-full"></div>
        <Navbar>
          <NavbarContent />
        </Navbar>
        <Slot />
        <div class="gradient absolute bottom-0 left-1/4 h-1/5 w-6/12 rounded-full"></div>
        <div class="relative bottom-8 left-full flex flex-col">
          {messagesProvider.messages.map((item, key) => (
            <Message
              id={item.id}
              key={key}
              variant={item.variant}
              message={item.message}
              isVisible={item.isVisible}
            />
          ))}
        </div>
      </div>
    </>
  );
});
