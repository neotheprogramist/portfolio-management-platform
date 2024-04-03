import { TitleDescription } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import WalletConnect from "~/components/wallet-connect";
import { Copyright } from "~/components/paragraph/paragraph";
import { mainnet, sepolia } from "viem/chains";

export default component$(() => {
  return (
    <>
      <div class="background-container">
        {/* <img src="../../public/assets/icons/vector1.svg" alt="" srcset="" class="w-full"/> */}
      </div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid gap-10 pt-20">
          <div class="grid max-w-md justify-items-center gap-6">
            <IconLogo class="h-6 w-28" />
            <TitleDescription
              title="Login to Emeth"
              description="Log in to the app using your Crypto Wallet"
            />
          </div>
          <div class="grid justify-items-center gap-3">
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
              enableWalletConnect={true}
              enableInjected={true}
              enableCoinbase={true}
              chains={[mainnet, sepolia]}
            />
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center gap-6 pb-10">
          <Button
            image="/assets/icons/info-white.svg"
            text="How to use Wallet?"
            class="w-52 !border-0 bg-customBlue py-2 pl-2 pr-3 text-xs"
          />
          <Copyright />
        </div>
      </div>
    </>
  );
});
