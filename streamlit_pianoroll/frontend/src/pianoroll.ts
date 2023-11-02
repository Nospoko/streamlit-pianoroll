import { NoteSequence } from "./types"
import { DEVON_R } from "./colors"


class PianoRoll {
  svgElement: SVGSVGElement; // or HTMLElement if it's not specifically an SVG element
  end: any | null; // Replace 'any' with the appropriate type
  backgroundColormap: any; // Replace 'any' with the appropriate type
  colormap: any; // Replace 'any' with the appropriate type

  constructor(svgElement: SVGSVGElement, sequence: NoteSequence) {
    this.svgElement = svgElement;
    this.end = null;

    this.svgElement.setAttribute("viewBox", "0 0 1 1");
    this.svgElement.setAttribute("preserveAspectRatio", "none");
    this.colormap = DEVON_R;

    this.drawPianoRoll(sequence);
  }

  // You should also define types for any methods of the class.
  drawPianoRoll(sequence: NoteSequence): void {
    // Implementation here
    this.drawEmptyPianoRoll(40, 69);
  }

  public drawEmptyPianoRoll(pitchMin: number, pitchMax: number): void {
    const pitchSpan = pitchMax - pitchMin;
    for (let it = pitchMin; it <= pitchMax + 1; it++) {
      const y = 1 - (it - pitchMin) / pitchSpan;
      const height = 1 / pitchSpan;

      // Draw black keys
      if ([1, 3, 6, 8, 10].includes(it % 12)) {
        this.drawBlackKeyBackground(y, height);
      }

      // Draw key separator lines
      this.drawKeySeparator(y + height, it % 12 === 0);
    }
  }

  private drawBlackKeyBackground(y: number, height: number): void {
    const rect = this.createRectangle(0, y, 1, height, this.colormap[12], 0.666);
    this.svgElement.appendChild(rect);
  }

  private drawKeySeparator(y: number, isOctave: boolean): void {
    const line = this.createLine(0, y, 2, y, isOctave ? 0.003 : 0.001);
    this.svgElement.appendChild(line);
  }

  private createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    fillOpacity: number,
  ): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', `${x}`);
    rect.setAttribute('y', `${y}`);
    rect.setAttribute('width', `${width}`);
    rect.setAttribute('height', `${height}`);
    rect.setAttribute('fill', fill);
    rect.setAttribute('fill-opacity', `${fillOpacity}`);
    return rect;
  }

  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeWidth: number,
    color: string = 'black',
  ): SVGLineElement {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', `${x1}`);
    line.setAttribute('y1', `${y1}`);
    line.setAttribute('x2', `${x2}`);
    line.setAttribute('y2', `${y2}`);
    line.setAttribute('stroke-width', `${strokeWidth}`);
    line.setAttribute('stroke', 'black');
    return line;
  }
}

export default PianoRoll;
