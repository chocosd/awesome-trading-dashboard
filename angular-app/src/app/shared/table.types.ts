export enum ColumnType {
  Text = 'Text',
  Indicator = 'Indicator',
  Time = 'Time',
  Currency = 'Currency',
  Number = 'Number',
}

export interface TableColumn<T> {
  key: keyof T & string;
  label: string;
  type?: ColumnType;
  styles?: Partial<Record<'cell' | 'header' | 'wrapper', string>>;
  pipe?: Array<'date' | 'currency' | 'number' | string>;
  colorBySign?: boolean;
}

export interface TableAction<T> {
  label: string;
  icon?: string;
  onClick: (row: T) => void;
}

export interface TableConfig<T> {
  paginated?: boolean;
  rows: TableColumn<T>[];
  actions?: TableAction<T>[];
}
