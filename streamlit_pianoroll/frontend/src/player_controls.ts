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

    console.log(this.midiPlayer.shadowRoot)

    this.generateControls()
    this.applyCustomStyling()
  }

  private applyCustomStyling() {
    const styles = `
    .controls > * {
      margin: 0;
    }

    input[type="range"] {
      appearance: none;
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.4);
      border-radius: 3px;
      background-image: linear-gradient(#ffffff, #ffffff);
      background-size: 85% 100%;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    [dir="rtl"] input[type="range"] {
      background: #ffffff;
      background-image: linear-gradient(#ffffff, #ffffff);
      background-size: 15% 100%;
      background-repeat: no-repeat;
    }

    /* Input Thumb */
    input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    input[type="range"]::-moz-range-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    input[type="range"]::-ms-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    /* Input Track */
    input[type="range"]::-webkit-slider-runnable-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"]::-moz-range-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"]::-ms-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    controls .button {
      height: 2.5rem;
      width: 2.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 0;
      padding: 0.25rem;
      appearance: none;
      border: none;
      cursor: pointer;
      background-color: transparent;
      overflow: hidden;
    }

    .mute-button:hover + .slider-wrapper {
      margin-right: 4px;
      width: 64px;
      visibility: visible;
    }

    .slider-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      width: 0;
      transition: all 200ms;
      visibility: hidden;
      height: 40px;
    }

    .slider-wrapper:hover {
      margin-right: 4px;
      width: 64px;
      visibility: visible;
    }

    .fullscreen-button:hover svg {
      animation: pulse 0.3s ease-in-out;
    }

    @keyframes pulse {
      0%,
      100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.2);
      }
    }
    `

    this.playerStyles.innerHTML += styles
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
    // Create left controls part
    // this.controlsLeft.className = "pianoroll-controls-left"
    this.controlsLeft.setAttribute("part", "pianoroll-controls-left")

    // Replace play icon
    const playButtonPlayIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    playButtonPlayIcon.setAttribute("width", "14")
    playButtonPlayIcon.setAttribute("height", "18")
    playButtonPlayIcon.setAttribute("viewBox", "0 0 14 18")
    playButtonPlayIcon.setAttribute("fill", "currentColor")

    const playButtonPlayPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    )
    playButtonPlayPath.setAttribute("d", "M1 1L13 9L1 17V1Z")
    playButtonPlayPath.setAttribute("stroke", "currentColor")
    playButtonPlayPath.setAttribute("stroke-width", "2")
    playButtonPlayPath.setAttribute("stroke-linecap", "round")
    playButtonPlayPath.setAttribute("stroke-linejoin", "round")
    playButtonPlayIcon.appendChild(playButtonPlayPath)

    const playSVG = this.playButton.querySelector(
      ".icon.play-icon"
    ) as HTMLSpanElement
    playSVG.innerHTML = " "
    playSVG.appendChild(playButtonPlayIcon)

    // Replace pause icon
    const playButtonPauseIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    playButtonPauseIcon.setAttribute("width", "14")
    playButtonPauseIcon.setAttribute("height", "18")
    playButtonPauseIcon.setAttribute("viewBox", "0 0 14 18")
    playButtonPauseIcon.setAttribute("fill", "currentColor")
    playButtonPauseIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    const playButtonPausePath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    )
    playButtonPausePath.setAttribute(
      "d",
      "M0 17C0 17.5523 0.447715 18 1 18H3.66667C4.21895 18 4.66667 17.5523 4.66667 17V1C4.66667 0.447716 4.21895 0 3.66667 0H0.999999C0.447714 0 0 0.447715 0 1V17ZM10.3333 0C9.78105 0 9.33333 0.447715 9.33333 1V17C9.33333 17.5523 9.78105 18 10.3333 18H13C13.5523 18 14 17.5523 14 17V1C14 0.447716 13.5523 0 13 0H10.3333Z"
    )
    playButtonPauseIcon.appendChild(playButtonPausePath)

    const stopSVG = this.playButton.querySelector(
      ".icon.stop-icon"
    ) as HTMLSpanElement
    stopSVG.innerHTML = " "
    stopSVG.appendChild(playButtonPauseIcon)

    // // Replace error icon
    // const playButtonErrorIcon = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "svg"
    // )
    // playButtonErrorIcon.setAttribute("width", "18")
    // playButtonErrorIcon.setAttribute("height", "18")
    // playButtonErrorIcon.setAttribute("viewBox", "0 0 18 18")
    // playButtonErrorIcon.setAttribute("fill", "none")
    // playButtonErrorIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    // const playButtonErrorPath = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "path"
    // )
    // playButtonErrorPath.setAttribute(
    //   "d",
    //   "M9 6.5V9.83333M9 12.3333V12.3417M1.5 9C1.5 9.98491 1.69399 10.9602 2.0709 11.8701C2.44781 12.7801 3.00026 13.6069 3.6967 14.3033C4.39314 14.9997 5.21993 15.5522 6.12987 15.9291C7.03982 16.306 8.01509 16.5 9 16.5C9.98491 16.5 10.9602 16.306 11.8701 15.9291C12.7801 15.5522 13.6069 14.9997 14.3033 14.3033C14.9997 13.6069 15.5522 12.7801 15.9291 11.8701C16.306 10.9602 16.5 9.98491 16.5 9C16.5 8.01509 16.306 7.03982 15.9291 6.12987C15.5522 5.21993 14.9997 4.39314 14.3033 3.6967C13.6069 3.00026 12.7801 2.44781 11.8701 2.0709C10.9602 1.69399 9.98491 1.5 9 1.5C8.01509 1.5 7.03982 1.69399 6.12987 2.0709C5.21993 2.44781 4.39314 3.00026 3.6967 3.6967C3.00026 4.39314 2.44781 5.21993 2.0709 6.12987C1.69399 7.03982 1.5 8.01509 1.5 9Z"
    // )
    // playButtonErrorPath.setAttribute("stroke", "currentColor")
    // playButtonErrorPath.setAttribute("stroke-width", "2")
    // playButtonErrorPath.setAttribute("stroke-linecap", "round")
    // playButtonErrorPath.setAttribute("stroke-linejoin", "round")

    // playButtonErrorIcon.appendChild(playButtonErrorPath)

    // const errorSVG = this.playButton.querySelector(
    //   ".icon.error-icon"
    // ) as HTMLSpanElement
    // errorSVG.innerHTML = " "
    // errorSVG.appendChild(playButtonErrorIcon)

    // Create mute button with volume control input
    this.muteButton.className = "mute-button"
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

    this.sliderWrapper.className = "slider-wrapper"
    this.sliderWrapper.setAttribute("part", "slider-wrapper")

    this.volumeSlider.setAttribute("part", "volume")
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

    // Append mute button and volume slider to left controls
    this.controlsLeft.appendChild(this.muteButton)
    this.controlsLeft.appendChild(this.sliderWrapper)
  }

  private generateRightControls() {
    // Create right controls part
    // this.controlsRight.className = "pianoroll-controls-right"
    this.controlsRight.setAttribute("part", "pianoroll-controls-right")

    // Create fullscreen button
    // this.fullscreenButton.id = "fullscreen-button"
    this.fullscreenButton.className = "button fullscreen-button"
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

    // Append fullscreen button to right controls
    this.controlsRight.appendChild(this.fullscreenButton)
  }
}

export default PlayerControls
