import { $, component$, useContext } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Button } from "~/components/button-signin/button-signin";
import { Copyright } from "~/components/paragraph/paragraph";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import {
  getNonceServer,
  verifyMessageServer,
} from "~/components/wallet-connect/server";
import { disconnect, getAccount, getChainId, signMessage } from "@wagmi/core";
import { SiweMessage } from "siwe";
import { TitleDescription } from "~/components/login-text/login-text";
import IconHandshake from "/public/assets/icons/signin/handshake.svg?jsx";

export default component$(() => {
  const nav = useNavigate();
  const loc = useLocation();
  const modalStore = useContext(ModalStoreContext);

  const signInHandler = $(async () => {
    console.log("clicked");
    if (modalStore.isConnected && modalStore.config) {
      console.log("connected");
      const { address } = getAccount(modalStore.config);
      console.log("address", address);
      const chainId = getChainId(modalStore.config);
      console.log("chainId", chainId);
      const { nonce } = await getNonceServer();
      console.log("nonce", nonce);
      const message = new SiweMessage({
        version: "1",
        domain: loc.url.host,
        uri: loc.url.origin,
        address,
        chainId,
        nonce,
        // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
        statement: "Sign to continue...",
      }).prepareMessage();
      console.log("message", message);
      const signature = await signMessage(modalStore.config, {
        message,
      });
      console.log("signature", signature);
      const { refreshToken } = await verifyMessageServer(message, signature);
      console.log("refreshToken", refreshToken);
      localStorage.setItem("refreshToken", refreshToken);
      console.log("setting refresh token");
      await nav("/app/dashboard");
    }
  });

  const cancelHandler = $(async () => {
    if (modalStore.isConnected && modalStore.config) {
      await disconnect(modalStore.config);
      await nav("/");
    }
  });

  return (
    <>
      <div class="background-container"></div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid min-w-[448px] max-w-md gap-10 pt-20">
          <div class="grid justify-items-center gap-6">
            <IconHandshake class="h-auto w-auto" />
            <TitleDescription
              title="Welcome to Emeth"
              description="By connecting your wallet and using Emeth, you agree to our Terms of Service and Privacy Policy."
            />
          </div>
          <div class="grid w-full grid-cols-2 justify-items-center gap-4">
            <Button
              onClick$={cancelHandler}
              text="Cancel"
              border="custom-border-1"
              width="w-full"
            />
            <Button
              onClick$={signInHandler}
              text="Accept and Sign"
              width="w-full"
              class="rounded-[48px] bg-black py-[14.5px]"
              background="border-none bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-[1px]"
            />
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center pb-10">
          <Copyright />
        </div>
      </div>
    </>
  );
});
