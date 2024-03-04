import { Gradient } from "~/components/gradient/gradient";
import { LoginText } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradientMain from "/public/images/gradient-main.png?jsx";

export default component$(() => {
  return (
    <>
      <Navbar/>
      <div class="grid grid-cols-[30%_60%_5%]">
        <div class="w-[766px] h-[655px]">
          <ImgGradientMain alt="gradient" />
        </div>
        <div class="grid grid-rows-[2fr_1fr]">
          <div class="grid gap-10 content-end">
            <LoginText/>
            <div class="grid grid-rows-2 items-center justify-center gap-3 text-center text-sm">
              <Button
                image="/images/svg/metamask-icon.svg"
                text="Use Metamask"
              />
              <Button
                image="/images/svg/walletconnect-icon.svg"
                text="Use WalletConnect"
              />
            </div>
          </div>
          <div class="grid gap-6 justify-items-center content-end text-xs">
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
        <div class="grid justify-items-end content-center">
            <Gradient/>
        </div>
      </div>
    </>
  );
});
