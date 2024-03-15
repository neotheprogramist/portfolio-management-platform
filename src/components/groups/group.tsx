import { Slot, component$ } from "@builder.io/qwik";
import ArrowDown from "/public/images/svg/portfolio/arrowDown.svg?jsx";
import EditIcon from "/public/images/svg/portfolio/edit.svg?jsx";

export interface GroupProps {
  name?: string;
}

export const Group = component$<GroupProps>((props) => {
  return (
    <>
      <div>
        <div class="flex h-[50px] pb-[8px] pt-[24px] text-[14px]">
          <div class="flex items-center gap-[8px] ">
            <ArrowDown />
            <h3>{props.name}</h3>
            <EditIcon />
          </div>
        </div>
        <Slot />
      </div>
    </>
  );
});
