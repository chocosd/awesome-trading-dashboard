export interface Funds {
  cash: number; // available cash balance
  equity: number; // cash + market value of holdings
  buyingPower: number; // margin-based if needed, else = cash
}
