import { component$, $ } from "@builder.io/qwik";
import jwt from "jsonwebtoken";
import { mainnet, arbitrum, type Chain } from "viem/chains";
import { reconnect } from "@wagmi/core";
import { createWeb3Modal, defaultWagmiConfig } from "@web3modal/wagmi";
import { createSIWEConfig } from "@web3modal/siwe";
import { SiweMessage } from "siwe";
import {
  type RouteLocation,
  server$,
  useLocation,
  z,
} from "@builder.io/qwik-city";

const metadata = {
  name: "Web3Modal",
  description: "Web3Modal Example",
  url: "https://web3modal.com",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

export const getSession = server$(async function () {
  const secret = this.env.get("ACCESS_TOKEN_SECRET");
  const accessToken = this.cookie.get("accessToken");
  if (!secret || !accessToken) {
    throw new Error("Missing secret or access token");
  }
  const tokenValidator = z.object({ address: z.string(), chainId: z.number() });
  const token = jwt.verify(accessToken.value, secret);
  console.log(token);
  const result = tokenValidator.parse(token);
  console.log("Decoded Token", result);
  return { address: result.address, chainId: result.chainId };
});

export const returnSIWEConfig = (loc: RouteLocation) => {
  const siweConfig = createSIWEConfig({
    createMessage: ({ nonce, address, chainId }) =>
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
      const response = await fetch(`/auth`);
      const { nonce } = await response.json();

      if (!nonce) {
        throw new Error("Failed to get nonce!");
      }

      return nonce;
    },
    getSession: async () => {
      const session = await getSession();
      console.log("Session", session);
      const { address, chainId } = session;
      return { address, chainId };
    },
    verifyMessage: async ({ message, signature }) => {
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
          const { refreshToken } = result;
          localStorage.setItem("refreshToken", refreshToken);
          return true;
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
  return siweConfig;
};

export const returnWeb3ModalAndClient = async (
  projectId: string,
  loc: RouteLocation,
) => {
  const chains: [Chain, ...Chain[]] = [arbitrum, mainnet];
  const config = defaultWagmiConfig({
    chains, // required
    projectId, // required
    metadata, // required
    enableWalletConnect: true, // Optional - true by default
    enableInjected: true, // Optional - true by default
    enableEIP6963: true, // Optional - true by default
    enableCoinbase: true, // Optional - true by default
  });
  reconnect(config);
  const modal = createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: true, // Optional - defaults to your Cloud configuration
    siweConfig: returnSIWEConfig(loc),
  });
  return modal;
};

export default component$(() => {
  const loc = useLocation();

  const setWeb3Modal = $(async () => {
    const projectId = import.meta.env.PUBLIC_PROJECT_ID;
    if (!projectId || typeof projectId !== "string") {
      throw new Error("Missing project ID");
    }
    const modal = await returnWeb3ModalAndClient(projectId, loc);
    return modal;
  });

  const openWeb3Modal = $(async () => {
    const modal = await setWeb3Modal();
    await modal.open();
  });

  return (
    <button
      onClick$={openWeb3Modal}
      class="font-sora ml-4 cursor-pointer rounded-full border-none bg-transparent bg-gradient-to-r from-orange-500 via-red-500 to-blue-500 p-1 text-white"
    >
      <div class="rounded-full bg-black p-4">Accept and Sign</div>
    </button>
  );
});
