import { Gradient } from "~/components/gradient/gradient";
import { LoginText } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradientMain from "/public/images/Gradient.png?jsx";
import WalletConnect from "~/components/wallet-connect";
import { Paragraph } from "~/components/paragraph/paragraph";

export default component$(() => {
  return (
    <>
      <Navbar class="fixed"/>
      <div class="grid grid-cols-[1fr_2fr_auto] h-full items-center">
        <div class="h-[766px] w-[655px]">
          <ImgGradientMain class="h-full" alt="gradient" style="object-position: -129px 0;"/>
        </div>
        <div class="grid grid-rows-[2fr_2fr] pt-52 min-w-[340px]">
          <div class="grid justify-items-center gap-10">
            <LoginText />
            <div>
              <Button
                image="/images/svg/metamask-icon.svg"
                text="Use Metamask"
              />
              <WalletConnect
                image="/images/svg/walletconnect-icon.svg"
                text="Use WalletConnect"
                class="mt-3"
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
            <Paragraph />
          </div>
        </div>
        <Gradient />
      </div>
    </>
  );
});
