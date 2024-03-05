import { component$ } from "@builder.io/qwik";

export const LoginText = component$(() => {
  return (
    <div class="text-center">
      <h1 class="pb-6 text-4xl font-medium">Login to Emeth</h1>
      <p class="text-base font-normal ">
        Log in to the app using your Crypto Wallet
      </p>
    </div>
  );
});
