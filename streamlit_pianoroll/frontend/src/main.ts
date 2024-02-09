import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement } from "./types"
import { enhancePianoRollSvg } from "./enhanceVisualizer"

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

  handleButtons()
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

function handleTheaterMode(_: Event): void {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement

  const pianorollPlayer = visualization.querySelector(
    ".pianoroll-player"
  )! as HTMLDivElement

  resetMode()

  if (pianorollPlayer.dataset.mode === "theater") {
    visualization.classList.remove("theater-mode")
    delete pianorollPlayer.dataset.mode
  } else {
    visualization.classList.add("theater-mode")
    pianorollPlayer.dataset.mode = "theater"
  }
}

function handleFullscreenMode(_: Event): void {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement

  const pianorollPlayer = visualization.querySelector(
    ".pianoroll-player"
  )! as HTMLDivElement

  resetMode()

  if (pianorollPlayer.dataset.mode === "fullscreen") {
    visualization.classList.remove("fullscreen-mode")
    delete pianorollPlayer.dataset.mode
    document.exitFullscreen()
  } else {
    visualization.classList.add("fullscreen-mode")
    pianorollPlayer.dataset.mode = "fullscreen"
    visualization.requestFullscreen()
  }
}

function resetMode(): void {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement

  visualization.classList.remove("theater-mode")
  visualization.classList.remove("fullscreen-mode")
  if (document.fullscreenElement) document.exitFullscreen()
}

function handleButtons(): void {
  const theaterButton = document.getElementById(
    "theater-button"
  )! as HTMLButtonElement
  const fullscreenButton = document.getElementById(
    "fullscreen-button"
  )! as HTMLButtonElement

  theaterButton.addEventListener("click", handleTheaterMode)
  fullscreenButton.addEventListener("click", handleFullscreenMode)
}
