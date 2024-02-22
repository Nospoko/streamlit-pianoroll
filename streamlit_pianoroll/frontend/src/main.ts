import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement } from "./types"
import { enhancePianoRollSvg } from "./enhanceVisualizer"

import ViewsController from "./views_controller"

export function afterContentLoaded() {
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement

  // These are here to verify that it works, TODO delete if not operation critical
  player.addEventListener(
    "start",
    () => {
      Streamlit.setFrameHeight()
    },
    false
  )

  player.addEventListener(
    "load",
    () => {
      Streamlit.setFrameHeight()
    },
    false
  )

  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement
  const pianoRollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  const pianoRollButtons = document.getElementById(
    "pianoroll-buttons"
  )! as HTMLDivElement
  const fullscreenButton = document.getElementById(
    "fullscreen-button"
  )! as HTMLButtonElement
  const pianoRollOverlay = document.getElementById(
    "pianoroll-overlay"
  )! as HTMLDivElement

  new ViewsController(
    visualization,
    pianoRollPlayer,
    pianoRollButtons,
    fullscreenButton,
    pianoRollOverlay
  )
}

export function onStreamlitRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  let midi_data = data.args["midi_data"]
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement

  // TODO: better typing, try to avoid "as unknown"
  const pianorollSvg = document.getElementById(
    "my-svg"
  )! as unknown as SVGSVGElement
  pianorollSvg.innerHTML = ""

  // Calculate the target height to maintain a 16:9 aspect ratio.
  const targetHeight = pianorollSvg.clientWidth / (16 / 9);

  // Set the calculated height on the SVG element.
  pianorollSvg.style.height = `${targetHeight}`;

  // Prepare the notes and viualization manager (PianoRoll)
  const note_sequence = midi_data.notes
  const pianorollSvgVisualizer = enhancePianoRollSvg(pianorollSvg)
  const pianoRoll = new PianoRoll(pianorollSvgVisualizer, note_sequence)

  pianorollSvgVisualizer.reload = () => {}
  pianorollSvgVisualizer.clearActiveNotes = () => {}
  pianorollSvgVisualizer.redraw = (noteDetails) => {
    const currentTime = noteDetails.startTime
    pianoRoll.redrawWithNewTime(currentTime)
  }
  player.addVisualizer(pianorollSvgVisualizer)

  // TODO Clean code
  const notes_per_second = 30
  const last_note_start = Math.max(
    ...midi_data.notes.map((note: any) => note.endTime)
  )
  const n_tick_notes = Math.ceil(last_note_start * notes_per_second)

  for (let it = 0; it < n_tick_notes; it++) {
    // Insert fake notes guaranteed to be silent
    // I'm not happy about using pitch=0, because we get a shitload of warnings
    // in console.log about it, but I wasn't able to get it to be truly silent
    // any other way - velocity=0 doesn't work as expected for some reason
    const tickTime = it / notes_per_second
    let timeTickNote = {
      pitch: 0,
      velocity: 0,
      isDrum: false,
      program: 0,
      startTime: tickTime,
      endTime: tickTime + 0.1,
      instrument: 0,
    }

    midi_data.notes.push(timeTickNote)
  }
  // *noteSequence* in the player is a more complex structure than a sequence of notes
  player.noteSequence = midi_data
}
