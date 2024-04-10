import { HeroText } from "~/components/HeroText/HeroText";
import { component$ } from "@builder.io/qwik";
import { ConnectButton } from "~/components/Buttons/Buttons";
import WalletConnect from "~/components/wallet-connect";
import { Copyright } from "~/components/paragraph/paragraph";
import { mainnet, sepolia } from "viem/chains";
import IconLogo from "/public/assets/icons/logo.svg?jsx";

export default component$(() => {
  return (
    <>
      <div class="background-container"></div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid min-w-[448px] max-w-md gap-10 pt-20">
          <HeroText
            title="Login to Emeth"
            description="Log in to the app using your Crypto Wallet"
          >
            <IconLogo class="h-6 w-28" />
          </HeroText>
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
          <ConnectButton
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
