export type NoteSequence = {
  // TODO Make it consistent with reality
  notes: Array<{ pitch: number; duration: number; }>;
};

export interface MidiPlayerElement extends HTMLElement {
  noteSequence?: NoteSequence;
  addVisualizer(visualizer: MidiVisualizerElement): void;
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
}
