import { Streamlit, RenderData } from "streamlit-component-lib"

import PianoRoll from "./pianoroll"
import { MidiPlayerElement, PianoRollSvgVisualizer } from "./types"
import { enhancePianoRollSvg } from "./enhanceVisualizer"

import ViewsController from "./views_controller"
import PlayerControls from "./player_controls"
import PlayerProgressController from "./player_progress_controller"

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
}

function preparePlayerControls(
  player: MidiPlayerElement,
  pianoRoll: PianoRoll,
  pianoRollSvgVisualizer: PianoRollSvgVisualizer,
  showBirdView: boolean
) {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement
  const pianoRollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  const pianoRollButtons = document.getElementById(
    "pianoroll-controls"
  )! as HTMLDivElement
  const pianoRollOverlay = document.getElementById(
    "pianoroll-overlay"
  )! as HTMLDivElement

  const playerControls = new PlayerControls(player, pianoRoll)

  const playButton = document.getElementById("play-button") as HTMLButtonElement
  player.addEventListener("load", () => {
    playerControls.generateCustomSeekBar()
    playerControls.applyCustomEventListeners(playButton)
  })

  new ViewsController(
    visualization,
    pianoRollPlayer,
    pianoRollButtons,
    playerControls.fullscreenButton,
    pianoRollOverlay
  )

  if (showBirdView) {
    const playerProgressController = new PlayerProgressController(
      playerControls,
      pianoRoll,
      visualization
    )

    pianoRollSvgVisualizer.reload = () => {}
    pianoRollSvgVisualizer.clearActiveNotes = () => {}
    pianoRollSvgVisualizer.redraw = (noteDetails: any) => {
      const currentTime = noteDetails.startTime
      pianoRoll.redrawWithNewTime(currentTime)
      const newPosition = currentTime / player.duration

      playerControls.updateSeekBarPosition(currentTime)
      playerProgressController.updateProgressIndicatorPosition(newPosition)
      playerProgressController.updateCurrentAreaRectanglePosition()
    }
    player.addVisualizer(pianoRollSvgVisualizer)
  } else {
    pianoRollSvgVisualizer.reload = () => {}
    pianoRollSvgVisualizer.clearActiveNotes = () => {}
    pianoRollSvgVisualizer.redraw = (noteDetails) => {
      const currentTime = noteDetails.startTime
      pianoRoll.redrawWithNewTime(currentTime)

      playerControls.updateSeekBarPosition(currentTime)
    }

    player.addVisualizer(pianoRollSvgVisualizer)
  }
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

  const showBirdView = data.args["show_bird_view"]

  preparePlayerControls(player, pianoRoll, pianorollSvgVisualizer, showBirdView)

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
