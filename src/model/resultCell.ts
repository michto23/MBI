import {Constants} from "utils/constants"

/**
 * Class of result matrix cell.
 */
export class ResultCell {
  labelX: string;
  labelY: string;
  value: number;
  selected: boolean;

  constructor(labelX:string, labelY:string, value: number) {
    this.labelX = labelX;
    this.labelY = labelY;
    this.value = value;
    this.selected = false;
  }
}
