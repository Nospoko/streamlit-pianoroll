import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement, MidiVisualizerElement } from "./types"
import { enhancePianoRollSvg } from './enhanceVisualizer';


export function afterContentLoaded() {
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;

  player.addEventListener('start', () => {
    console.log("EVENT!");
    Streamlit.setFrameHeight()
  }, false);

  player.addEventListener('load', () => {
    console.log("LOAD EVENT!");
    Streamlit.setFrameHeight()
  }, false);
}

export function onStreamlitRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  let note_sequence = data.args["note_sequence"]
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;
  player.noteSequence = note_sequence;

  // TODO: better typing, try to avoid "as unknown"
  const visualizer = document.getElementById("my-visualizer")! as MidiVisualizerElement;
  player.addVisualizer(visualizer);
  visualizer.noteSequence = note_sequence;

  const pianorollSvg = document.getElementById("my-svg")! as unknown as SVGSVGElement;
  const pianorollSvgVisualizer = enhancePianoRollSvg(pianorollSvg);
  const pianoRoll = new PianoRoll(pianorollSvgVisualizer, note_sequence);
}
