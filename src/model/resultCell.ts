import {Constants} from "utils/constants"

export class ResultCell {
  labelX: string;
  labelY: string;
  value: number;
  // nuclMap : { [key:string]:number; } = {};

  constructor(labelX:string, labelY:string, value: number) {
    this.labelX = labelX;
    this.labelY = labelY;
    this.value = value;
  }
}
