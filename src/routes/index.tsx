import { Gradient } from "~/components/gradient/gradient";
import { LoginText } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradient from "/public/assets/images/gradient.png?jsx";
import WalletConnect from "~/components/wallet-connect";
import { Paragraph } from "~/components/paragraph/paragraph";
import { mainnet, sepolia } from "viem/chains";

export default component$(() => {
  return (
    <>
      <Navbar class="fixed !border-0" />
      <div class="grid h-full grid-cols-[1fr_2fr_auto] items-center">
        <div class="h-[766px] w-[655px]">
          <ImgGradient
            class="h-full"
            alt="gradient"
            style="object-position: -129px 0;"
          />
        </div>
        <div class="grid min-w-[340px] grid-rows-[2fr_2fr] pt-52">
          <div class="grid justify-items-center gap-10">
            <LoginText />
            <div>
              <WalletConnect
                image="/assets/icons/login/metamask.svg"
                text="Use Metamask"
                enableWalletConnect={false}
                enableInjected={false}
                enableCoinbase={false}
                chains={[mainnet, sepolia]}
              />
              <WalletConnect
                image="/assets/icons/login/walletconnect.svg"
                text="Use WalletConnect"
                class="mt-3"
                enableWalletConnect={true}
                enableInjected={true}
                enableCoinbase={true}
                chains={[mainnet, sepolia]}
              />
            </div>
          </div>
          <div class="grid content-end justify-items-center gap-6 text-xs">
            <Button
              image="/assets/icons/info.svg"
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
