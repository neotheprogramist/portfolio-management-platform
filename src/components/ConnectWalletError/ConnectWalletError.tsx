import { component$ } from "@builder.io/qwik";
import { HeroText } from "~/components/HeroText/HeroText";
import IconError from "/public/assets/icons/error.svg?jsx";
import { Button } from "~/components/Buttons/Buttons";

export const ConnectWalletError = component$(() => {
  return (
    <>
      <HeroText
        title="Error Connecting"
        description="The connection attempt failed. Please click try again and follow the steps to connect in your wallet."
      >
        <IconError />
      </HeroText>
      <div class="grid justify-items-center gap-4">
        <Button
          text="Try Again"
          width="w-[284px]"
          class="rounded-[48px] bg-black py-[13.5px] font-medium"
          background="border-none custom-btn-gradient p-[2.5px]"
        />
        <p class="cursor-pointer text-xs font-medium underline">
          Go back to wallet selection
        </p>
      </div>
    </>
  );
});
