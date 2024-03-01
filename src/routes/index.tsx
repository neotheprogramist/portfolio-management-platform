import {
  component$,
  useVisibleTask$,
  useStore,
  noSerialize,
  type NoSerialize,
  useTask$,
} from "@builder.io/qwik";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { mainnet, arbitrum, sepolia } from "viem/chains";
import { reconnect, type Config } from "@wagmi/core";
import { type Web3Modal } from "@web3modal/wagmi/dist/types/src/client";
import {
  type Web3ModalSIWEClient,
  createSIWEConfig,
  type SIWECreateMessageArgs,
  type SIWEVerifyMessageArgs,
} from "@web3modal/siwe";
import { server$, useLocation, useNavigate } from "@builder.io/qwik-city";
import { SiweMessage } from "siwe";
import { getCookie, isTokenExpired } from "~/utils/refresh";
import { ImagesBlock } from "~/components/images-block/images-block";
import { ButtonAccept } from "~/components/button-accept/button-accept";
import { ButtonCancel } from "~/components/button-cancel/button-cancel";
import { Gradient } from "~/components/gradient/gradient";
import { Paragraph } from "~/components/paragraph/paragraph";
import { WelcomeText } from "~/components/welcome-text/welcome-text";
import { setupTokensData } from "~/utils/setupTokens";

export const getSession = server$(async (address, chainId) => {
  return { address, chainId };
});

export default component$(() => {
  const nav = useNavigate();
  const loc = useLocation();

  const modalStore = useStore<{
    config?: NoSerialize<Config>;
    modal?: NoSerialize<Web3Modal>;
    address?: `0x${string}`;
    chainId?: number;
    siweConfig?: NoSerialize<Web3ModalSIWEClient>;
  }>({
    config: undefined,
    modal: undefined,
    address: undefined,
    chainId: undefined,
    siweConfig: undefined,
  });

  useTask$(async () => {
    setupTokensData();
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    const siweConfig = createSIWEConfig({
      createMessage: ({ nonce, address, chainId }: SIWECreateMessageArgs) =>
        new SiweMessage({
          version: "1",
          domain: loc.url.host,
          uri: loc.url.origin,
          address,
          chainId,
          nonce,
          // Human-readable ASCII assertion that the user will sign, and it must not contain `\n`.
          statement: "Sign to continue...",
        }).prepareMessage(),
      getNonce: async () => {
        if (!modalStore.address) {
          throw new Error("Address is not defined!");
        }
        const response = await fetch(`/auth`, {
          method: "GET",
          headers: {
            "X-Address": modalStore.address,
          },
        });
        const { nonce } = await response.json();

        if (!nonce) {
          throw new Error("Failed to get nonce!");
        }

        return nonce;
      },
      getSession: async () => {
        const session = await getSession(
          modalStore.address,
          modalStore.chainId,
        );
        const { address, chainId } = session;
        return { address, chainId };
      },
      verifyMessage: async ({ message, signature }: SIWEVerifyMessageArgs) => {
        try {
          const response = await fetch(`/auth`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message,
              signature,
            }),
          });

          if (!response.ok) {
            return false;
          }
          const result = await response.json();

          if (typeof result === "object") {
            const { isValid, refreshToken } = result;
            localStorage.setItem("refreshToken", refreshToken);
            return isValid;
          }

          return false;
        } catch (error) {
          return false;
        }
      },
      signOut: async () => {
        try {
          const response = await fetch("/auth", { method: "DELETE" });
          if (!response.ok) {
            throw new Error("Logout failed");
          }

          localStorage.removeItem("refreshToken");
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    modalStore.siweConfig = noSerialize(siweConfig);

    const config = defaultWagmiConfig({
      chains: [mainnet, arbitrum, sepolia],
      projectId: import.meta.env.PUBLIC_PROJECT_ID,
      metadata: {
        name: "Web3Modal",
        description: "Web3Modal Example",
        url: "http://localhost", // origin must match your domain & subdomain
        icons: ["https://avatars.githubusercontent.com/u/37784886"],
      },
      // if true can not open modal, error occurs
      enableCoinbase: false,
    });

    await reconnect(config);

    if (!modalStore.config) {
      modalStore.config = noSerialize(config);
    }
    if (!modalStore.modal) {
      modalStore.modal = noSerialize(
        createWeb3Modal({
          wagmiConfig: config,
          projectId: "26aebf5aa6f44cc2a8f74e674e0617b9",
          siweConfig,
        }),
      );
    }
  });

  return (
    <>
      <main class="flex h-screen bg-black">
        <ImagesBlock />
        <div class="max-w-3/5 font-sora m-auto flex flex-col space-y-10 text-center text-white">
          <WelcomeText />
          <div class="text-center">
            <ButtonCancel />
            <ButtonAccept modalStore={modalStore} />
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
      </main>
    </>
  );
});
