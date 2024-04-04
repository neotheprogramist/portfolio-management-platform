import { PeriodState, PeriodStateHours } from "~/interface/balance/Balance";

export function generateTimestamps(
  timeRange: number,
  interval: number,
): string[] {
  const timestamps: string[] = [];
  const currentTimestamp = Date.now();
  const startTime = currentTimestamp - timeRange * 60 * 60 * 1000;

  for (
    let timestamp: number = startTime;
    timestamp <= currentTimestamp;
    timestamp += interval * 60 * 60 * 1000
  ) {
    const tsUnix = new Date(timestamp)
      .toISOString()
      .replace(/\.(\d+)Z$/, "+00:00");
    timestamps.push(tsUnix);
  }

  return timestamps;
}

export function getSelectedPeriodInHours(dataPeriod: PeriodState) {
  const availablePeriods: PeriodStateHours = {
    "24h": 24,
    "1W": 168,
    "1M": 720,
    "1Y": 8760,
  };
  const availableIntervals: PeriodStateHours = {
    "24h": 6,
    "1W": 24,
    "1M": 96,
    "1Y": 720,
  };
  for (const key in dataPeriod) {
    if (dataPeriod[key])
      return {
        period: availablePeriods[key],
        interval: availableIntervals[key],
      };
  }
  return {
    period: 0,
    interval: 0,
  };
}
