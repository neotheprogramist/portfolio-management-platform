import { LoginText } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Button } from "~/components/button-login/button-login";
import WalletConnect from "~/components/wallet-connect";
import { Paragraph } from "~/components/paragraph/paragraph";
import { mainnet, sepolia } from "viem/chains";

export default component$(() => {
  return (
    <>
      <div class="grid h-full min-w-80 grid-rows-[2fr_0.5fr] items-center">
        <div class="grid justify-items-center items-center gap-10">
          <IconLogo class="w-28 h-6"/>
          <LoginText/>
          <div class="grid gap-3">
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
        <div class="grid justify-items-center gap-6">
          <Button
            image="/assets/icons/info-white.svg"
            text="How to use Wallet?"
            class="w-52 py-2 pr-3 pl-2 text-xs !border-0 bg-customBlue"
          />
          <Paragraph />
        </div>
      </div>
    </>
  );
});
