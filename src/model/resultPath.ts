/**
 * Class of result solution.
 */
export class ResultPath {
  path: Array<string>;
  matrixesPositions: Array<Array<number>>;
  log: string;
  id: number;

  constructor(path:Array<string>, matrixesPositions:Array<Array<number>>, id: number) {
    this.path = path;
    this.matrixesPositions = matrixesPositions;
    this.id = id;
    this.log = this.prepareLog();
  }

  private prepareLog() : string {
    let log = "";

    log += "Dopasowanie globalne nr " + (this.id / 2 + 1).toString() + ":\n";
    log += "Sekwencja 1: " + this.path[0] + "\n";
    log += "Sekwencja 2: " + this.path[1] + "\n";
    log += "Sekwencja 3: " + this.path[2] + "\n";
    log += "Ścieżka rozwiązania: (" + this.matrixesPositions.join(")→(") + ")\n\n";

    return log;
  }
}
