import { Note, NoteSequence, NoteRectangleInfo } from "./types"
import { DEVON_R } from "./colors"


class PianoRoll {
  svgElement: SVGSVGElement;
  keyboardSvg: SVGSVGElement;
  notesSvg: SVGSVGElement;
  end: number;
  start: number;
  pitchMin!: number
  pitchMax!: number
  pitchSpan!: number
  noteHeight!: number;
  backgroundColormap: any;
  colormap: any;
  displayedNotes!: NoteRectangleInfo[];
  timeIndicator: SVGLineElement | null;

  constructor(svgElement: SVGSVGElement, sequence: NoteSequence) {
    this.svgElement = svgElement;
    this.timeIndicator = null;
    this.start = 0;
    this.end = 1;

    this.svgElement.setAttribute("viewBox", "0 0 1 1");
    this.svgElement.setAttribute("preserveAspectRatio", "none");

    this.notesSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.notesSvg.setAttribute("width", "98%");
    this.notesSvg.setAttribute("height", "100%");
    this.notesSvg.setAttribute("x", "2%");

    this.notesSvg.innerHTML = ""
    this.notesSvg.setAttribute("viewBox", "0 0 1 1");
    this.notesSvg.setAttribute("preserveAspectRatio", "none");
    this.svgElement.appendChild(this.notesSvg);

    // Sub-SVG to draw the keyboard on
    this.keyboardSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.keyboardSvg.setAttribute("width", "2%");
    this.keyboardSvg.setAttribute("height", "100%");

    this.keyboardSvg.innerHTML = ""
    this.keyboardSvg.setAttribute("viewBox", "0 0 1 1");
    this.keyboardSvg.setAttribute("preserveAspectRatio", "none");
    this.svgElement.appendChild(this.keyboardSvg);

    this.colormap = DEVON_R;

    this.drawPianoRoll(sequence);
  }

  public drawPianoRoll(sequence: NoteSequence): void {
    this.start = sequence[0].startTime;
    this.end = sequence[sequence.length - 1].endTime - (this.start || 0);

    const pitches = sequence.map(note => note.pitch);

    this.pitchMin = Math.min(...pitches);
    this.pitchMax = Math.max(...pitches);
    this.pitchSpan = this.pitchMax - this.pitchMin;

    if (this.pitchSpan < 24) {
      const diff = 24 - this.pitchSpan;
      this.pitchMin -= Math.ceil(diff / 2);
      this.pitchMax += Math.floor(diff / 2);
    }

    this.pitchMin -= 3;
    this.pitchMax += 3;
    this.pitchSpan = this.pitchMax - this.pitchMin;
    this.noteHeight = 1 / this.pitchSpan;

    this.drawKeyboard(this.pitchMin, this.pitchMax);
    this.drawEmptyPianoRoll(this.pitchMin, this.pitchMax);

    this.drawNotes(sequence);

    // Time indicator
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '0');
    line.setAttribute('y1', '0');
    line.setAttribute('x2', '0');
    line.setAttribute('y2', '1');
    line.setAttribute('stroke', '#E8A03E');
    line.setAttribute('stroke-width', '0.002');
    this.timeIndicator = line;
    this.notesSvg.appendChild(this.timeIndicator);
  }

  public redrawWithNewTime(currentTime: number): void {
    // Transform time to x coordinate
    const new_x = this.timeToX(currentTime);

    // Move the time bar
    if (this.timeIndicator) {
      this.timeIndicator.setAttribute('x1', `${new_x}`);
      this.timeIndicator.setAttribute('x2', `${new_x}`);
    }

    // To make the rectangle grow symmetrically, we have
    // to move it half of the growth in the other direction
    const height_gain = this.noteHeight * 0.8
    const new_height = this.noteHeight + height_gain;

    // Change colors for playing notes
    this.displayedNotes.forEach(note => {
      if (note.x_left <= new_x && note.x_right > new_x) {
        // This class controls the transition rate (see note-noteRectangle.active css)
        note.noteRectangle.classList.add('active');

        // Special color for active notes
        note.noteRectangle.setAttribute('fill', '#5DB5D5');

        // Make it dance
        const new_y = note.y - height_gain / 2;
        note.noteRectangle.setAttribute('y', `${new_y}`);
        note.noteRectangle.setAttribute('height', `${new_height}`);
      }
      else if (note.x_right < new_x) {
        note.noteRectangle.classList.remove('active');

        // Bring back to default look
        note.noteRectangle.setAttribute('fill', note.velocity_color);
        note.noteRectangle.setAttribute('height', `${note.height}`);
        note.noteRectangle.setAttribute('y', `${note.y}`);
      }
    });
  }

  private timeToX(time: number): number {
    return time / this.end;
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

  private drawNotes(sequence: NoteSequence): void {
    this.displayedNotes = []
    sequence.forEach((note: Note) => {
      const noteRectangleInfo = this.createNoteRectangle(note);

      this.notesSvg.appendChild(noteRectangleInfo.noteRectangle);
      this.displayedNotes.push(noteRectangleInfo);
    });
  }

  private createNoteRectangle(
    note: Note,
  ): NoteRectangleInfo {
    const noteRectangle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    const x = this.timeToX(note.startTime - (this.start || 0));
    const w = this.timeToX(note.endTime - note.startTime);
    const y = 1 - (note.pitch - this.pitchMin) / (this.pitchMax - this.pitchMin);
    const color = this.colormap[note.velocity];

    noteRectangle.setAttribute('x', `${x}`);
    noteRectangle.setAttribute('width', `${w}`);
    noteRectangle.setAttribute('y', `${y}`);
    noteRectangle.setAttribute('height', `${this.noteHeight}`);
    noteRectangle.setAttribute('fill', color);
    noteRectangle.classList.add('note-rectangle');

    // Store it
    let trackedNote = {
      noteRectangle: noteRectangle,
      velocity_color: color,
      y: y,
      x_left: x,
      x_right: x + w,
      width: w,
      height: this.noteHeight,
    };

    return trackedNote;
  }

  private drawBlackKeyBackground(y: number, height: number): void {
    const rect = this.createRectangle(0, y, 1, height, this.colormap[12], 0.666);
    this.notesSvg.appendChild(rect);
  }

  private drawKeySeparator(y: number, isOctave: boolean): void {
    const line = this.createLine(0, y, 2, y, isOctave ? 0.003 : 0.001);
    this.notesSvg.appendChild(line);
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

  drawKeyboard(pitch_min: number, pitch_max: number) {
    const pitch_span = pitch_max - pitch_min;
    for (let it = pitch_min; it <= pitch_max + 1; it++) {
      // Black keys
      if ([1, 3, 6, 8, 10].includes(it % 12)) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const y = 1 - (it - pitch_min) / pitch_span;
        const x = 0;
        const h = 1 / pitch_span;
        const w = 1;

        rect.setAttribute('fill', 'black');
        rect.setAttribute('x', `${x}`);
        rect.setAttribute('y', `${y}`);
        rect.setAttribute('width', `${w}`);
        rect.setAttribute('height', `${h}`);
        this.keyboardSvg.appendChild(rect);
      }

      // Key separation
      var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const y = 1 - (it - pitch_min) / pitch_span + 1 / pitch_span;
      line.setAttribute('x1', '0');
      line.setAttribute('y1', `${y}`);
      line.setAttribute('x2', '2');
      line.setAttribute('y2', `${y}`);
      let line_width;

      // Every octave, line is bolder
      if (it % 12 === 0) {
        line_width = 0.003;
      } else {
        line_width = 0.001;
      }
      line.setAttribute('stroke-width', `${line_width}`);
      line.setAttribute('stroke', 'black');
      this.keyboardSvg.appendChild(line);
    }

    var line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line2');
    line2.setAttribute('x1', '0.99');
    line2.setAttribute('y1', '0');
    line2.setAttribute('x2', '0.99');
    line2.setAttribute('y2', '1');
    line2.setAttribute('stroke-width', '0.01');
    line2.setAttribute('stroke', 'black');
    this.keyboardSvg.appendChild(line2);

    var line3 = document.createElementNS('http://www.w3.org/2000/svg', 'line3');
    line3.setAttribute('x1', '0');
    line3.setAttribute('y1', '0');
    line3.setAttribute('x2', '0');
    line3.setAttribute('y2', '1');
    line3.setAttribute('stroke-width', '0.01');
    line3.setAttribute('stroke', 'black');
    this.keyboardSvg.appendChild(line3);
  }
}

export default PianoRoll;
