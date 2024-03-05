import { Gradient } from "~/components/gradient/gradient";
import { LoginText } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradientMain from "/public/images/gradient-main.png?jsx";
import WalletConnect from "~/components/wallet-connect";

export default component$(() => {
  return (
    <>
      <Navbar />
      <div class="grid grid-cols-[30%_60%_5%]">
        <div class="h-[655px] w-[766px]">
          <ImgGradientMain alt="gradient" />
        </div>
        <div class="grid grid-rows-[2fr_1fr]">
          <div class="grid content-end gap-10">
            <LoginText />
            <div class="m-auto">
              <Button
                image="/images/svg/metamask-icon.svg"
                text="Use Metamask"
                class="text-center text-sm"
              />
              <WalletConnect
                image="/images/svg/walletconnect-icon.svg"
                text="Use WalletConnect"
                class="mt-3 text-center text-sm"
              />
            </div>
          </div>
          <div class="grid content-end justify-items-center gap-6 text-xs">
            <Button
              image="/images/svg/info.svg"
              text="How to use Wallet?"
              padding="8px 12px 8px 8px"
              buttonWidth="200px"
              borderColor="#2196F3"
              containerGap="8px"
              fontSize="12px"
            />
            <p>©2024 Golem Network. All rights reserved.</p>
          </div>
        </div>
        <div class="grid content-center justify-items-end">
          <Gradient />
        </div>
      </div>
    </>
  );
});
