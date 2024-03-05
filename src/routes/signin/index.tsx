import { component$ } from "@builder.io/qwik";
import { useNavigate } from "@builder.io/qwik-city";
import { getCookie, isTokenExpired } from "~/utils/refresh";
import { ButtonCancel } from "~/components/button-cancel/button-cancel";
import { Gradient } from "~/components/gradient/gradient";
import { Paragraph } from "~/components/paragraph/paragraph";
import { WelcomeText } from "~/components/welcome-text/welcome-text";
import { Navbar } from "~/components/navbar/navbar";
import ImgGradientMain from "/public/images/gradient-main.png?jsx";

export default component$(() => {
  const nav = useNavigate();

  return (
    <>
      <Navbar />
      <div class="flex">
        <div class="h-[655px] w-[766px]">
          <ImgGradientMain alt="gradient" />
        </div>
        <div class="font-sora m-auto flex flex-col space-y-10 text-center text-white">
          <WelcomeText />
          <div class="flex">
            <ButtonCancel />
            <button class="font-sora ml-4 cursor-pointer rounded-full border-none bg-transparent bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-1 text-white">
              <div class="rounded-full bg-black p-4">Accept and Sign</div>
            </button>
            <button
              class="font-sora ml-4 cursor-pointer rounded-full border-none bg-gradient-to-r from-orange-500 via-yellow-500 to-blue-500 px-2 text-white"
              onClick$={async () => {
                const accessToken = getCookie("accessToken");
                if (accessToken && isTokenExpired(accessToken)) {
                  const refreshToken = localStorage.getItem("refreshToken");
                  const response = await fetch("/auth", {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ refreshToken }),
                  });
                  const data = await response.json();
                  localStorage.setItem("refreshToken", data.refreshToken);
                }
                await nav("/app/dashboard");
              }}
            >
              <div class="rounded-full bg-black px-6 py-4">Dashboard</div>
            </button>
          </div>
          <Paragraph />
        </div>
        <Gradient />
      </div>
    </>
  );
});
