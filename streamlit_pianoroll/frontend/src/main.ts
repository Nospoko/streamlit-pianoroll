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

  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement

  pianorollPlayer.addEventListener("mouseenter", handlePianorollMouseEnter)
  pianorollPlayer.addEventListener("mouseleave", handlePianorollMouseLeave)
  pianorollPlayer.addEventListener("animationend", handlePianorollAnimationEnd)
  document.addEventListener("fullscreenchange", handleEscapeFullscreen)

  resetTimer()
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

function handleFullscreenMode(): void {
  const visualization = document.getElementById(
    "visualization"
  )! as HTMLDivElement

  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement

  if (pianorollPlayer.dataset.mode === "fullscreen") {
    visualization.classList.remove("fullscreen-mode")
    if (document.fullscreenElement) document.exitFullscreen()
    delete pianorollPlayer.dataset.mode
    handleFullscreenIcon("open")
  } else {
    visualization.classList.add("fullscreen-mode")
    pianorollPlayer.dataset.mode = "fullscreen"
    visualization.requestFullscreen()
    handleFullscreenIcon("close")
  }
}

function handleButtons(): void {
  const fullscreenButton = document.getElementById(
    "fullscreen-button"
  )! as HTMLButtonElement

  fullscreenButton.addEventListener("click", handleFullscreenMode)
}

function handleFullscreenIcon(state: "open" | "close"): void {
  const fullscreenButton = document.getElementById(
    "fullscreen-button"
  )! as HTMLButtonElement

  const fullscreenIcons = {
    open: `
    <path
      fill="currentColor"
      d="M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"
    />`,
    close: `
    <path
      fill="currentColor"
      d="M5 16h3v3h2v-5H5zm3-8H5v2h5V5H8zm6 11h2v-3h3v-2h-5zm2-11V5h-2v5h5V8z"
    />`,
  }

  if (fullscreenIcons[state]) {
    const icon = `
    <svg
      focusable="false"
      aria-hidden="true"
      viewBox="0 0 24 24"
      height="32px"
      width="32px"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${fullscreenIcons[state]}
    </svg>`

    fullscreenButton.innerHTML = icon
  }
}

function handleEscapeFullscreen(): void {
  if (!document.fullscreenElement) {
    const pianorollPlayer = document.getElementById(
      "pianoroll-player"
    )! as HTMLDivElement
    const visualization = document.getElementById(
      "visualization"
    )! as HTMLDivElement

    visualization.classList.remove("fullscreen-mode")
    delete pianorollPlayer.dataset.mode
  }
}

function handlePianorollMouseEnter(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement

  showPlayerControls()

  pianorollPlayer.addEventListener("mousemove", handleCursor)
}

function handlePianorollMouseLeave(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement

  hidePlayerControls()

  pianorollPlayer.removeEventListener("mousemove", handleCursor)
  clearTimeout(timeoutId)
}

function handlePianorollAnimationEnd(e: AnimationEvent): void {
  const overlay = e.target! as HTMLDivElement
  const pianorollButtons = document.getElementById(
    "pianoroll-buttons"
  )! as HTMLDivElement

  if (e.animationName === "fadeOut") {
    overlay.classList.remove("fadeOut")
    pianorollButtons.classList.remove("fadeOut")
    overlay.classList.add("hidden")
    pianorollButtons.classList.add("hidden")
  }
}

function hidePlayerControls(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  const pianorollButtons = document.getElementById(
    "pianoroll-buttons"
  )! as HTMLDivElement
  const overlay = pianorollPlayer.querySelector(
    ".gradient-overlay"
  )! as HTMLDivElement

  overlay.classList.remove("fadeIn")
  pianorollButtons.classList.remove("fadeIn")
  overlay.classList.add("fadeOut")
  pianorollButtons.classList.add("fadeOut")
  pianorollPlayer.dataset.overlay = "false"
}

function showPlayerControls(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  const pianorollButtons = document.getElementById(
    "pianoroll-buttons"
  )! as HTMLDivElement
  const overlay = pianorollPlayer.querySelector(
    ".gradient-overlay"
  )! as HTMLDivElement

  overlay.classList.remove("hidden")
  pianorollButtons.classList.remove("hidden")
  overlay.classList.add("fadeIn")
  pianorollButtons.classList.add("fadeIn")
  pianorollPlayer.dataset.overlay = "true"
}

let timeoutId: ReturnType<typeof setTimeout> | undefined

function hideCursor(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  pianorollPlayer.style.cursor = "none"

  hidePlayerControls()
}

function showCursor(): void {
  const pianorollPlayer = document.getElementById(
    "pianoroll-player"
  )! as HTMLDivElement
  // pianorollPlayer.style.cursor = "auto"
  pianorollPlayer.style.removeProperty("cursor")

  showPlayerControls()
}

function resetTimer(): void {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  timeoutId = setTimeout(hideCursor, 3000)
}

function handleCursor(): void {
  showCursor()
  resetTimer()
}
