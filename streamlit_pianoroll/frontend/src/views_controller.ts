import { Streamlit } from "streamlit-component-lib"

class ViewsController {
  visualization: HTMLDivElement
  pianoRollPlayer: HTMLDivElement
  pianoRollButtons: HTMLDivElement
  fullscreenButton: HTMLButtonElement
  pianoRollOverlay: HTMLDivElement
  timeoutRef: ReturnType<typeof setTimeout> | undefined

  constructor(
    visualization: HTMLDivElement,
    pianoRollPlayer: HTMLDivElement,
    pianoRollButtons: HTMLDivElement,
    fullscreenButton: HTMLButtonElement,
    pianoRollOverlay: HTMLDivElement
  ) {
    this.visualization = visualization
    this.pianoRollPlayer = pianoRollPlayer
    this.pianoRollButtons = pianoRollButtons
    this.fullscreenButton = fullscreenButton
    this.pianoRollOverlay = pianoRollOverlay
    this.timeoutRef = undefined

    this.initializeEventsListeners()
    this.resetCursorTimer()
  }

  private initializeEventsListeners = (): void => {
    this.fullscreenButton.addEventListener("click", this.toggleFullscreenMode)
    this.pianoRollPlayer.addEventListener(
      "mouseenter",
      this.pianoRollMouseEnter
    )
    this.pianoRollPlayer.addEventListener(
      "mouseleave",
      this.pianoRollMouseLeave
    )
    this.pianoRollPlayer.addEventListener(
      "animationend",
      this.pianoRollAnimationEnd
    )
    document.addEventListener("fullscreenchange", this.escapeFullscreen)
  }

  private toggleFullscreenMode = (): void => {
    if (this.pianoRollPlayer.dataset.mode === "fullscreen") {
      if (document.fullscreenElement) document.exitFullscreen()
    } else {
      this.visualization.classList.add("fullscreen-mode")
      this.pianoRollPlayer.dataset.mode = "fullscreen"
      this.visualization.requestFullscreen()
      this.drawFullscreenIcon("close")
    }
  }

  private drawFullscreenIcon = (state: "open" | "close"): void => {
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

      this.fullscreenButton.innerHTML = icon
    }
  }

  private escapeFullscreen = (): void => {
    if (!document.fullscreenElement) {
      this.visualization.classList.remove("fullscreen-mode")
      delete this.pianoRollPlayer.dataset.mode
      this.drawFullscreenIcon("open")
      Streamlit.setFrameHeight()
    }
  }

  private pianoRollMouseEnter = (): void => {
    this.showPlayerControls()

    this.pianoRollPlayer.addEventListener("mousemove", this.setCursorVisible)
  }

  private pianoRollMouseLeave = (): void => {
    this.hidePlayerControls()

    this.pianoRollPlayer.removeEventListener("mousemove", this.setCursorVisible)
    clearTimeout(this.timeoutRef)
  }

  private pianoRollAnimationEnd = (e: AnimationEvent): void => {
    if (e.animationName === "fadeOut") {
      this.pianoRollOverlay.classList.remove("fadeOut")
      this.pianoRollButtons.classList.remove("fadeOut")
      this.pianoRollOverlay.classList.add("hidden")
      this.pianoRollButtons.classList.add("hidden")
    }
  }

  private hidePlayerControls = (): void => {
    this.pianoRollOverlay.classList.remove("fadeIn")
    this.pianoRollButtons.classList.remove("fadeIn")
    this.pianoRollOverlay.classList.add("fadeOut")
    this.pianoRollButtons.classList.add("fadeOut")
    this.pianoRollPlayer.dataset.overlay = "false"
  }

  private showPlayerControls = (): void => {
    this.pianoRollOverlay.classList.remove("hidden")
    this.pianoRollButtons.classList.remove("hidden")
    this.pianoRollOverlay.classList.add("fadeIn")
    this.pianoRollButtons.classList.add("fadeIn")
    this.pianoRollPlayer.dataset.overlay = "true"
  }

  private hideCursor = (): void => {
    this.pianoRollPlayer.style.cursor = "none"

    this.hidePlayerControls()
  }

  private showCursor = (): void => {
    this.pianoRollPlayer.style.removeProperty("cursor")

    this.showPlayerControls()
  }

  private resetCursorTimer = (): void => {
    if (this.timeoutRef) clearTimeout(this.timeoutRef)

    this.timeoutRef = setTimeout(this.hideCursor, 3000)
  }

  private setCursorVisible = (): void => {
    this.showCursor()
    this.resetCursorTimer()
  }
}

export default ViewsController
