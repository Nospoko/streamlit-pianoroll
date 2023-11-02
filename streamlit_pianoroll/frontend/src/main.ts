import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement } from "./types"
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

  let midi_data = data.args["midi_data"];
  const note_sequence = midi_data.notes;
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;

  // *noteSequence* in the player is a more complex structure than a sequence of notes
  player.noteSequence = midi_data;

  // TODO: better typing, try to avoid "as unknown"
  const pianorollSvg = document.getElementById("my-svg")! as unknown as SVGSVGElement;
  pianorollSvg.innerHTML = "";

  const pianorollSvgVisualizer = enhancePianoRollSvg(pianorollSvg);
  const pianoRoll = new PianoRoll(pianorollSvgVisualizer, note_sequence);

  pianorollSvgVisualizer.reload = () => {};
  pianorollSvgVisualizer.clearActiveNotes = () => {};
  pianorollSvgVisualizer.redraw = (noteDetails) => {
    const currentTime = noteDetails.startTime;
    pianoRoll.redrawWithNewTime(currentTime);
  }
  player.addVisualizer(pianorollSvgVisualizer);
}
