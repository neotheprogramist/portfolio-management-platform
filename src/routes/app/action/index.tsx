import { component$, useVisibleTask$ } from "@builder.io/qwik";
import ImgMinimalize from "/public/assets/icons/minimalize.svg?jsx";
import IconArrowDown from "/public/assets/icons/arrow-down.svg?jsx";
import * as d3 from "d3";

const chart = () => {
  const data = [
    [0, 70],
    [1, 70],
    [2, 70],
    [3, 70],
    [4, 70],
  ] as [number, number][];

  // Declare the chart dimensions and margins.
  const width = 1310;
  const height = 364;
  const marginTop = 10;
  const marginRight = 0;
  const marginBottom = 30;
  const marginLeft = 30;

  // Declare the x (horizontal position) scale.
  const x = d3.scaleLinear([0, 4], [marginLeft, width - marginRight]);

  // Declare the y (vertical position) scale.
  const y = d3.scaleLinear([20, 120], [height - marginBottom, marginTop]);

  // Declare the line generator.
  const line = d3
    .line()
    .x((d) => x(d[0]))
    .y((d) => y(d[1]));

  // Create the SVG container.
  const svg = d3.create("svg").attr("width", width).attr("height", height);

  // Add the x-axis.
  svg
    .append("g")
    .attr("transform", `translate(0,${height - marginBottom})`)
    .attr("opacity", 0.1)
    .call(
      d3
        .axisBottom(x)
        .ticks(3)
        .tickFormat(d3.format("d"))
        .tickSize(-height + marginTop + marginBottom)
        .tickPadding(12),
    )
    .call((g) => {
      // manipulate the elements' attrs here
      g.select("path").attr("opacity", 0);
    });

  // Add the y-axis
  svg
    .append("g")
    .attr("transform", `translate(${marginLeft},0)`)
    .attr("opacity", 0.1)
    .call(
      d3
        .axisLeft(y)
        .ticks(5)
        .tickFormat(d3.format("d"))
        .tickSize(-width + marginLeft + marginRight)
        .tickPadding(12),
    )
    .call((g) => {
      // manipulate the elements' attrs here
      g.select("path").attr("opacity", 0);
    });

  svg
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "white")
    .attr("stroke-width", 1)
    .attr("d", line(data));

  // Append the svg element
  const container = document.getElementById("container");
  container!.append(svg.node()!);
};

export interface PortfolioValueProps {
  totalPortfolioValue: string;
}

export default component$<PortfolioValueProps>(({ totalPortfolioValue }) => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(() => {
    chart();
  });
  return (
    <div class="custom-border-1 custom-bg-white custom-shadow m-[40px] grid grid-rows-[52px_32px_1fr_110px] gap-[16px] overflow-auto rounded-[16px] p-[24px]">
      <div class="custom-border-b-1 flex items-center justify-between pb-[16px]">
        <h1 class="text-[20px] font-semibold">Portfolio Value</h1>
        <div class="text-right">
          <h1 class="bg-gradient-to-r from-red-600 via-orange-400 to-pink-500 bg-clip-text pb-[8px] text-[20px] font-semibold text-transparent">
            ${totalPortfolioValue}
          </h1>
          <p class="text-[12px]">
            24h change: +23,4 <span class="text-[#24A148]">+0,84%</span>
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between gap-[8px] text-[12px]">
        <div class="flex items-center gap-2">
          <h2 class="custom-text-50 uppercase">Value over time</h2>
          <div class="custom-bg-white custom-border-1 flex h-[32px] gap-[8px] rounded-[8px] p-[3.5px]">
            <button class="custom-bg-button rounded-[8px] px-[8px]">24h</button>
            <button class="rounded-[8px] px-[8px]">1W</button>
            <button class="rounded-[8px] px-[8px]">1M</button>
            <button class="rounded-[8px] px-[8px]">1Y</button>
          </div>
        </div>

        <div class="flex items-center gap-[8px]">
          <h2 class="custom-text-50 uppercase lg:hidden">Portfolio</h2>
          <button class="custom-bg-white custom-border-1 flex h-[32px] items-center gap-[8px] rounded-[8px] px-[8px]">
            <p>All</p>
            <IconArrowDown />
          </button>
          <button class="custom-bg-white custom-border-1 h-[32px] items-center rounded-[8px] px-[8px]">
            <ImgMinimalize />
          </button>
        </div>
      </div>

      <div id="container"></div>
    </div>
  );
});
