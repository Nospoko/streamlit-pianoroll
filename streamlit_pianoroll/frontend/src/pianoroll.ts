import { Note, NoteSequence } from "./types"
import { DEVON_R } from "./colors"


class PianoRoll {
  svgElement: SVGSVGElement;
  end: number;
  start: number;
  noteHeight: number | null;
  backgroundColormap: any;
  colormap: any;

  constructor(svgElement: SVGSVGElement, sequence: NoteSequence) {
    this.svgElement = svgElement;
    this.noteHeight = null;
    this.start = 0;
    this.end = 1;

    this.svgElement.setAttribute("viewBox", "0 0 1 1");
    this.svgElement.setAttribute("preserveAspectRatio", "none");
    this.colormap = DEVON_R;

    this.drawPianoRoll(sequence);
  }

  public drawPianoRoll(sequence: NoteSequence): void {
    this.start = sequence[0].startTime;
    this.end = sequence[sequence.length - 1].endTime - (this.start || 0);

    const pitches = sequence.map(note => note.pitch);

    let pitchMin = Math.min(...pitches);
    let pitchMax = Math.max(...pitches);
    let pitchSpan = pitchMax - pitchMin;

    if (pitchSpan < 24) {
      const diff = 24 - pitchSpan;
      pitchMin -= Math.ceil(diff / 2);
      pitchMax += Math.floor(diff / 2);
    }

    pitchMin -= 3;
    pitchMax += 3;
    pitchSpan = pitchMax - pitchMin;
    this.noteHeight = 1 / pitchSpan;

    this.drawEmptyPianoRoll(pitchMin, pitchMax);

    this.drawNotes(sequence, pitchMin, pitchMax);
  }

  private timeToX(time: number): number {
    return time / this.end;
  }

  // You should also define types for any methods of the class.
  _drawPianoRoll(sequence: NoteSequence): void {
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

  private drawNotes(sequence: NoteSequence, pitchMin: number, pitchMax: number): void {
    sequence.forEach((note: Note) => {
      const noteRectangle = this.createNoteRectangle(note, pitchMin, pitchMax);
      this.svgElement.appendChild(noteRectangle);
    });
  }

  private createNoteRectangle(note: Note, pitchMin: number, pitchMax: number): SVGRectElement {
    const noteRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = this.timeToX(note.startTime - (this.start || 0));
    const w = this.timeToX(note.endTime - note.startTime);
    const y = 1 - (note.pitch - pitchMin) / (pitchMax - pitchMin);
    const color = this.colormap[note.velocity];

    noteRectangle.setAttribute('x', `${x}`);
    noteRectangle.setAttribute('width', `${w}`);
    noteRectangle.setAttribute('y', `${y}`);
    noteRectangle.setAttribute('height', `${this.noteHeight}`);
    noteRectangle.setAttribute('fill', color);
    noteRectangle.classList.add('note-rectangle');

    return noteRectangle;
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
