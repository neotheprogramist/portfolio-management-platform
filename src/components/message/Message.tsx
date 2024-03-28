import { component$, useSignal, useTask$ } from "@builder.io/qwik";

export interface MessageProps {
  variant?: "success" | "error" | "info";
  message: string;
}

export const Message = component$(
  ({ variant = "info", message = "" }: MessageProps) => {
    const isVisible = useSignal(true);

    useTask$(() => {
      const timeId = setTimeout(() => {
        isVisible.value = false;
      }, 5000);
      return () => {
        clearTimeout(timeId);
      };
    });

    if (!isVisible.value) return null;

    return (
      <>
        <div
          class={`fixed bottom-10 left-full flex min-w-24 max-w-96  animate-messageArrival  items-center rounded border p-2 ${variant === "success" ? "border-[#5CB660] bg-[#EDFEEE] text-[#5CB660]" : variant === "error" ? "border-[#F16360] bg-[#FDEDED] text-[#F16360]" : "border-[#1AB1F5] bg-[#E5F6FD] text-[#1AB1F5]"}`}
        >
          <div
            class={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full  border ${variant === "success" ? "border-[#5CB660]" : variant === "error" ? "border-[#F16360]" : "border-[#1AB1F5]"}`}
          >
            i
          </div>
          <div class="ml-2">{message}</div>
          <button
            class="flex h-8 w-8 items-center justify-center"
            onClick$={() => {
              isVisible.value = false;
            }}
          >
            x
          </button>
        </div>
      </>
    );
  },
);