import { component$ } from "@builder.io/qwik";
import ImgWelcomeIcon from "/public/images/svg/welcome-icon.svg?jsx";

export const WelcomeText = component$(() => {
  return (
    <div class="max-w-[426px] text-center">
      <ImgWelcomeIcon />
      <h1 class="py-6 text-8xl font-normal capitalize leading-none">
        Welcome to Emeth
      </h1>
      <p class="m-0 leading-relaxed">
        By connecting your wallet and using Emeth, you agree to our{" "}
        <a class="text-white" href="#">
          Terms of Service
        </a>{" "}
        and{" "}
        <a class="text-white" href="#">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
});
