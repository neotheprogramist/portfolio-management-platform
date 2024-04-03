import { TitleDescription } from "~/components/login-text/login-text";
import { component$ } from "@builder.io/qwik";
import { Copyright } from "~/components/paragraph/paragraph";

import IconError from "/public/assets/icons/error.svg?jsx";
import { Button } from "~/components/button-signin/button-signin";

export default component$(() => {
  return (
    <>
      <div class="background-container"></div>
      <div class="content-container grid h-full grid-rows-[85%_15%] items-center justify-items-center">
        <div class="grid min-w-[448px] max-w-md gap-10 pt-20">
          <div class="grid justify-items-center gap-6">
            <IconError class="h-auto w-auto" />
            <TitleDescription
              title="Error Connecting"
              description="The connection attempt failed. Please click try again and follow the steps to connect in your wallet."
            />
          </div>
          <div class="grid justify-items-center gap-4">
            <Button
              text="Try Again"
              width="w-[284px]"
              class="rounded-[48px] bg-black py-[14.5px] font-medium"
              background="border-none bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-[1px]"
            />
            <p class="cursor-pointer text-xs font-medium underline">
              Go back to wallet selection
            </p>
          </div>
        </div>
        <div class="grid h-full items-end justify-items-center pb-10">
          <Copyright />
        </div>
      </div>
    </>
  );
});
