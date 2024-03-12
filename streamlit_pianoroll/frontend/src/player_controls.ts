import { MidiPlayerElement } from "./types"

class PlayerControls {
  midiPlayer: MidiPlayerElement
  controlsLeft: HTMLDivElement
  controlsRight: HTMLDivElement
  muteButton: HTMLButtonElement
  sliderWrapper: HTMLDivElement
  volumeSlider: HTMLInputElement
  fullscreenButton: HTMLButtonElement
  playerStyles: HTMLStyleElement
  controlsElement: HTMLDivElement
  playButton: HTMLButtonElement
  timeElement: HTMLDivElement

  constructor(midiPlayer: MidiPlayerElement) {
    this.midiPlayer = midiPlayer
    this.controlsLeft = document.createElement("div")
    this.controlsRight = document.createElement("div")
    this.muteButton = document.createElement("button")
    this.sliderWrapper = document.createElement("div")
    this.volumeSlider = document.createElement("input")
    this.fullscreenButton = document.createElement("button")
    this.playerStyles = this.midiPlayer.shadowRoot
      .firstElementChild as HTMLStyleElement
    this.controlsElement = this.midiPlayer.shadowRoot.querySelector(
      '[part="control-panel"]'
    )! as HTMLDivElement
    this.playButton = this.controlsElement.querySelector(
      '[part="play-button"]'
    )!
    this.timeElement = this.controlsElement.querySelector('[part="time"]')!

    this.playerStyles.innerHTML += ".controls > * {\n  margin: 0;\n}"
    console.log(this.playerStyles.innerHTML)

    console.log(this.midiPlayer.shadowRoot)

    this.generateControls()
  }

  private generateControls() {
    this.generateLeftControls()
    this.generateRightControls()

    this.controlsElement.insertBefore(
      this.controlsRight,
      this.controlsElement.firstChild
    )
    this.controlsElement.insertBefore(
      this.controlsLeft,
      this.controlsElement.firstChild
    )
    this.controlsLeft.insertBefore(
      this.playButton,
      this.controlsLeft.firstChild
    )

    this.controlsLeft.appendChild(this.timeElement)
    // this.controlsElement.appendChild(this.controlsRight)
  }

  private generateLeftControls() {
    // this.controlsLeft.className = "pianoroll-controls-left"
    this.controlsLeft.setAttribute("part", "pianoroll-controls-left")

    this.muteButton.setAttribute("aria-label", "Mute")
    this.muteButton.setAttribute("title", "Mute")
    // this.muteButton.className = "button"
    this.muteButton.setAttribute("part", "mute-button")

    const muteButtonIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    muteButtonIcon.setAttribute("focusable", "false")
    muteButtonIcon.setAttribute("aria-hidden", "true")
    muteButtonIcon.setAttribute("viewBox", "0 0 24 24")
    muteButtonIcon.setAttribute("height", "24px")
    muteButtonIcon.setAttribute("width", "24px")

    const muteButtonPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    )
    muteButtonPath.setAttribute("fill", "currentColor")
    muteButtonPath.setAttribute(
      "d",
      "M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"
    )

    muteButtonIcon.appendChild(muteButtonPath)
    this.muteButton.appendChild(muteButtonIcon)

    // this.sliderWrapper.className = "slider-wrapper"
    this.sliderWrapper.setAttribute("part", "slider-wrapper")

    this.volumeSlider.setAttribute("title", "Volume")
    this.volumeSlider.setAttribute("role", "slider")
    this.volumeSlider.setAttribute("aria-label", "Volume")
    this.volumeSlider.setAttribute("aria-valuenow", "-3")
    this.volumeSlider.setAttribute("aria-valuetext", "-3dB volume")
    this.volumeSlider.setAttribute("aria-valuemin", "-50")
    this.volumeSlider.setAttribute("aria-valuemax", "5")
    this.volumeSlider.setAttribute("type", "range")
    this.volumeSlider.setAttribute("min", "-50")
    this.volumeSlider.setAttribute("max", "5")
    this.volumeSlider.setAttribute("value", "-3")
    // this.volumeSlider.id = "volume-slider"
    this.volumeSlider.setAttribute("autocomplete", "off")

    this.sliderWrapper.appendChild(this.volumeSlider)

    this.controlsLeft.appendChild(this.muteButton)
    this.controlsLeft.appendChild(this.sliderWrapper)
  }

  private generateRightControls() {
    // this.controlsRight.className = "pianoroll-controls-right"
    this.controlsRight.setAttribute("part", "pianoroll-controls-right")

    // this.fullscreenButton.id = "fullscreen-button"
    this.fullscreenButton.className = "button"
    this.fullscreenButton.setAttribute("part", "fullscreen-button")
    this.fullscreenButton.setAttribute("title", "Full screen")

    const fullscreenButtonIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    fullscreenButtonIcon.setAttribute("focusable", "false")
    fullscreenButtonIcon.setAttribute("aria-hidden", "true")
    fullscreenButtonIcon.setAttribute("viewBox", "0 0 24 24")
    fullscreenButtonIcon.setAttribute("height", "32px")
    fullscreenButtonIcon.setAttribute("width", "32px")

    const fullscreenButtonIconPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    )
    fullscreenButtonIconPath.setAttribute("fill", "currentColor")
    fullscreenButtonIconPath.setAttribute(
      "d",
      "M7 14H5v5h5v-2H7zm-2-4h2V7h3V5H5zm12 7h-3v2h5v-5h-2zM14 5v2h3v3h2V5z"
    )

    fullscreenButtonIcon.appendChild(fullscreenButtonIconPath)
    this.fullscreenButton.appendChild(fullscreenButtonIcon)

    this.controlsRight.appendChild(this.fullscreenButton)
  }
}

export default PlayerControls
