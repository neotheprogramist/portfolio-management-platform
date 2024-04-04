export type Balance = {
  id?: string;
  value: string;
};

export interface PeriodState {
  [key: string]: boolean;
}

export interface PeriodStateHours {
  [key: string]: number;
}
