import { NumericAxis, SciChartSurface } from 'scichart';

export interface CreateSciChartSurfaceOptions {
  rootElement: HTMLDivElement | string;
  backgroundColor: string;
  textColor: string;
}

const resolveRootElement = (rootElement: HTMLDivElement | string) => {
  return rootElement === String(rootElement)
    ? document.querySelector<HTMLDivElement>(rootElement)
    : rootElement;
};

export const createSciChartSurfaceWithAxes = async ({
  rootElement,
  backgroundColor,
  textColor,
}: CreateSciChartSurfaceOptions) => {
  const element = resolveRootElement(rootElement);
  if (!element) {
    throw new Error('SciChart root element not found');
  }

  const { sciChartSurface, wasmContext } = await SciChartSurface.create(element, {
    background: backgroundColor,
  });

  const axisOptions = { labelStyle: { color: textColor } };
  const xAxis = new NumericAxis(wasmContext, axisOptions);
  const yAxis = new NumericAxis(wasmContext, axisOptions);
  sciChartSurface.xAxes.add(xAxis);
  sciChartSurface.yAxes.add(yAxis);

  return { sciChartSurface };
};
