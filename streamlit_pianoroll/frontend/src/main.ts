import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement } from "./types"
import { enhancePianoRollSvg } from "./enhanceVisualizer"

import ViewsController from "./views_controller"
// import VolumeController from "./volume_controller"
import PlayerControls from "./player_controls"
import PlayerProgressController from "./player_progress_controller"

// Not the best solution but couldn't find better one
// Reference to PianoRoll object is needed to redraw rectangles
// TODO find better solution and remove types "any"
const renderRef: { pianoRollRef: any; pianoRollSvgVisualizer: any } = {
  pianoRollRef: null,
  pianoRollSvgVisualizer: null,
}

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
      preparePlayerControls(player)
    },
    false
  )
}

function preparePlayerControls(player: MidiPlayerElement) {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement
  const pianoRollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  const pianoRollButtons = document.getElementById(
    "pianoroll-controls"
  )! as HTMLDivElement
  // const fullscreenButton = document.getElementById(
  //   "fullscreen-button"
  // )! as HTMLButtonElement
  const pianoRollOverlay = document.getElementById(
    "pianoroll-overlay"
  )! as HTMLDivElement

  // const volumeInput = document.getElementById(
  //   "volume-slider"
  // ) as HTMLInputElement

  // new VolumeController(player, volumeInput)

  const playerControls = new PlayerControls(player)

  new ViewsController(
    visualization,
    pianoRollPlayer,
    pianoRollButtons,
    playerControls.fullscreenButton,
    pianoRollOverlay
  )

  const progressBar = visualization.querySelector(
    "#progress-bar"
  )! as SVGElement
  const progressLine = visualization.querySelector(
    "#progress-line"
  )! as SVGLineElement

  new PlayerProgressController(
    player,
    progressLine,
    progressBar,
    renderRef.pianoRollRef,
    renderRef.pianoRollSvgVisualizer
  )
}

export function onStreamlitRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  let midi_data = data.args["midi_data"]
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement

  // Streamlit is trying to refresh a pianoroll that already exists
  // so to prevent player reload we exit here
  // We need this because streamlit is confused about when to send render requests
  if (
    player.hasAttribute("data-midi") &&
    player.getAttribute("data-midi") === JSON.stringify(midi_data)
  ) {
    return
  } else player.setAttribute("data-midi", JSON.stringify(midi_data))

  // Fixed typing to avoid "as unknown"
  const pianorollSvg = document.querySelector("#my-svg")! as SVGSVGElement
  pianorollSvg.innerHTML = ""

  // Prepare the notes and viualization manager (PianoRoll)
  const note_sequence = midi_data.notes
  const pianorollSvgVisualizer = enhancePianoRollSvg(pianorollSvg)
  const pianoRoll = new PianoRoll(pianorollSvgVisualizer, note_sequence)

  // Create reference for other functions
  renderRef.pianoRollRef = pianoRoll
  renderRef.pianoRollSvgVisualizer = pianorollSvgVisualizer

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
