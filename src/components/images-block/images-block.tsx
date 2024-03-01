import { component$ } from "@builder.io/qwik";
import ImgGradientMain from "/public/images/gradient-main.png?jsx";
import ImgE from "/public/images/svg/e.svg?jsx";
import ImgMeth from "/public/images/svg/meth.svg?jsx";

export const ImagesBlock = component$(() => {
  return (
    <div class="h-screen">
      <div class="flex space-x-2 pl-12 pt-12">
        <ImgE />
        <ImgMeth />
      </div>
      <ImgGradientMain class="h-[90vh]" alt="gradient" />
    </div>
  );
});
