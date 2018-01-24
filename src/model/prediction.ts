export class Prediction {
  id_start : number;
  id_end : number;
  seconds : number;
  stop_order: number;

  constructor(id_start: number, id_end: number, seconds: number, stop_order: number) {
    this.id_start = id_start;
    this.id_end = id_end;
    this.seconds = seconds;
    this.stop_order = stop_order;
  }
}
