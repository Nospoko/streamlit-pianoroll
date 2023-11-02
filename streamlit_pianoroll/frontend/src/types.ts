export interface MidiPlayerElement extends HTMLElement {
  noteSequence?: NoteSequence;
  addVisualizer(visualizer: PianoRollSvgVisualizer): void;
}

export interface MidiVisualizerElement extends HTMLElement {
  noteSequence?: NoteSequence;
  reload(): void;
}

export interface PianoRollSvgVisualizer extends SVGSVGElement {
  noteSequence: NoteSequence; // Assuming NoteSequence is a type you've defined elsewhere
  play(): void;
  pause(): void;
  reload(): void;
  clearActiveNotes(): void;
  redraw(noteDetails: any): void;
}

export interface MidiData {
  noteSequence: NoteSequence;
  length: number;
}

export interface Note {
  startTime: number;
  endTime: number;
  pitch: number;
  velocity: number;
}

export type NoteSequence = Note[];
