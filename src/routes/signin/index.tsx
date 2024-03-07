import { $, component$, useContext } from "@builder.io/qwik";
import { useLocation, useNavigate } from "@builder.io/qwik-city";
import { Button } from "~/components/button-signin/button-signin";
import { Gradient } from "~/components/gradient/gradient";
import { Paragraph } from "~/components/paragraph/paragraph";
import { WelcomeText } from "~/components/welcome-text/welcome-text";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradientMain from "/public/images/gradient-main.png?jsx";
import { ModalStoreContext } from "~/interface/web3modal/ModalStore";
import { getNonceServer, verifyMessageServer } from "~/components/wallet-connect/server";
import { getAccount, getChainId, signMessage } from "@wagmi/core";
import { SiweMessage } from "siwe";

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

  return (
    <>
      <Navbar class="fixed" />
      <div class="grid h-full grid-cols-[1fr_2fr_auto] items-center">
        <div class="h-[766px] w-[655px]">
          <ImgGradientMain
            class="h-full"
            alt="gradient"
            style="object-position: -129px 0;"
          />
        </div>
        <div class="grid grid-rows-[2fr_1fr] pt-52">
          <div class="grid content-end justify-items-center gap-10 pb-10">
            <WelcomeText />
            <div class="flex gap-4 text-[14px]">
              <Button
                text="Cancel"
                border="border-white border-opacity-20"
                width="w-[98px]"
              />
              <Button
                text="Accept and Sign"
                width="w-[180px]"
                class="rounded-[48px] bg-black py-[15px]"
                background="border-none bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-[2px]"
              />
              <button
                class="hidden font-sora cursor-pointer rounded-full border-none bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 px-2"
                onClick$={signInHandler}
              >
                <div class="rounded-full bg-black px-6 py-4">Dashboard</div>
              </button>
            </div>
          </div>
          <div class="grid content-end justify-items-center">
            <Paragraph />
          </div>
        </div>
        <Gradient />
      </div>
    </>
  );
});
