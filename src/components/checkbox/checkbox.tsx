import { component$ } from "@builder.io/qwik";

export interface CheckBoxProps {
  hasText?: boolean;
  text?: string;
  description?: string;
  image?: string;
  placeholder?: string;
  type: string;

}

export const CheckBox = component$<CheckBoxProps>((props) => {
  return (
    <div>
      {/* <div                             
    class="relative">
      <input
      id="checkBox"
      type="checkbox" 
      class="absolute border-gradient custom-border-1 custom-bg-white end-4 top-3.5 h-5 w-5 appearance-none rounded checked:after:absolute checked:after:ms-[0.35rem] checked:after:mt-0.5 checked:after:h-2.5 checked:after:w-1.5 checked:after:border-solid checked:after:border-bg checked:after:rotate-45 hover:cursor-pointer focus:after:absolute focus:after:z-[1] z-10"
      />
      <label for="checkBox"
      class="absolute custom-bg-white w-full custom-border-1 inline-flex min-h-12 cursor-pointer items-center space-x-2 rounded-lg"
      >
        <span class="absolute start-2 flex gap-4 items-center">
          <div class="p-1 custom-border-1 rounded-lg">
            {props.image && <img src={props.image} width="24" height="24" />}
          </div>
          <div>
            <p>{props.text}</p>
            <p class="custom-text-50 text-xs">{props.description}</p>
          </div>
        </span>
      </label>
    </div> */}

      <div class="relative">
        <input
          id="checkBox"
          type="text"
          class="custom-border-1 absolute end-1.5 top-1.5 z-10 h-9 w-[375px] appearance-none rounded bg-transparent placeholder:text-white "
        />
        <label
          for="checkBox"
          class="custom-bg-white custom-border-1 absolute inline-flex min-h-12 w-full cursor-pointer items-center space-x-2 rounded-lg"
        >
          <span class="absolute start-2 flex gap-2">
            <div class="custom-border-1 mr-2 rounded-lg p-1">
              {props.image && <img src={props.image} width="24" height="24" />}
            </div>
            <div class="">
              <p>{props.text}</p>
              <p class="custom-text-50 text-xs">{props.description}</p>
            </div>
          </span>
        </label>
      </div>
    </div>
  );
});
