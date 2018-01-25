export class Cell {
  label: string;
  valueA : number;
  valueG : number;
  valueC : number;
  valueT : number;

  constructor(label:string, valueA: number, valueG: number, valueC: number, valueT: number) {
    this.label = label;
    this.valueA = valueA;
    this.valueG = valueG;
    this.valueC = valueC;
    this.valueT = valueT;
  }
}
