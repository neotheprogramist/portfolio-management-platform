import { component$ } from "@builder.io/qwik";
import IconHandshake from "/public/assets/icons/signin/handshake.svg?jsx";

export const WelcomeText = component$(() => {
  return (
    <div class="w-[426px] text-center">
      <div class="flex justify-center">
        <IconHandshake />
      </div>
      <h1 class="py-6 text-4xl font-medium">Welcome to Emeth</h1>
      <p class="text-base font-normal">
        By connecting your wallet and using Emeth, you agree to our{" "}
        <a
          class="text-white underline decoration-1 underline-offset-[3px]"
          href="#"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          class="text-white underline decoration-1 underline-offset-[3px]"
          href="#"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
});
