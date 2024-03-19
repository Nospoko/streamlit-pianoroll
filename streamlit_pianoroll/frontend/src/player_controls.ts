import PianoRoll from "./pianoroll"
import PlayerProgressController from "./player_progress_controller"
import { MidiPlayerElement, VolumeControl } from "./types"

import VolumeController from "./volume_controller"

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
  seekBarElement: HTMLInputElement
  volumeControl: VolumeControl
  isPlaying: boolean
  playingFlag: boolean
  pianoRoll: PianoRoll
  playerProgress: PlayerProgressController | null

  constructor(midiPlayer: MidiPlayerElement, pianoRoll: PianoRoll) {
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
    this.seekBarElement = document.createElement("input")
    this.isPlaying = this.midiPlayer.playing
    this.playingFlag = false
    this.pianoRoll = pianoRoll
    this.playerProgress = null

    this.generateControls()
    this.applyCustomStyling()
    this.applyCustomSeekBarEventListeners()

    this.volumeControl = new VolumeController(
      this.midiPlayer,
      this.volumeSlider,
      this.muteButton
    )
  }

  applyCustomStyling(externalStyles?: string) {
    const styles = `
    .controls > * {
      margin: 0;
    }

    /* Volume slider styling */
    input[type="range"].volume-slider {
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

    [dir="rtl"] input[type="range"].volume-slider {
      background: #ffffff;
      background-image: linear-gradient(#ffffff, #ffffff);
      background-size: 15% 100%;
      background-repeat: no-repeat;
    }

    /* Input Thumb */
    input[type="range"].volume-slider::-webkit-slider-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    input[type="range"].volume-slider::-moz-range-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    input[type="range"].volume-slider::-ms-thumb {
      appearance: none;
      height: 12px;
      width: 12px;
      border-radius: 50%;
      background: #ffffff;
      box-shadow: 0 0 2px 0 #505050;
    }

    /* Input Track */
    input[type="range"].volume-slider::-webkit-slider-runnable-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"].volume-slider::-moz-range-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"].volume-slider::-ms-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    /* SeekBar styling */
    input[type="range"].seek-bar {
      appearance: none;
      width: 100%;
      height: 3px;
      background: rgba(255, 255, 255, 0.6);
      border-radius: 3px;
      background-image: linear-gradient(#E8A03E, #E8A03E);
      background-size: 0% 100%;
      background-repeat: no-repeat;
      cursor: pointer;
    }

    [dir="rtl"] input[type="range"].seek-bar {
      background: #E8A03E;
      background-image: linear-gradient(#E8A03E, #E8A03E);
      background-size: 100% 100%;
      background-repeat: no-repeat;
    }

    input[type="range"].seek-bar:hover {
      height: 5px;
    }

    /* Input Thumb */
    input[type="range"].seek-bar:hover::-webkit-slider-thumb {
      height: 12px;
      width: 12px;
      visibility: visible;
      transition: all 200ms;
    }

    input[type="range"].seek-bar:hover::-moz-range-thumb {
      height: 12px;
      width: 12px;
      visibility: visible;
      transition: all 200ms;
    }

    input[type="range"].seek-bar:hover::-ms-thumb {
      height: 12px;
      width: 12px;
      visibility: visible;
      transition: all 200ms;
    }

    input[type="range"].seek-bar::-webkit-slider-thumb {
      appearance: none;
      height: 0;
      width: 0;
      border-radius: 50%;
      background: #E8A03E;
      box-shadow: 0 0 2px 0 #505050;
      visibility: hidden;
    }

    input[type="range"].seek-bar::-moz-range-thumb {
      appearance: none;
      height: 0;
      width: 0;
      border-radius: 50%;
      background: #E8A03E;
      box-shadow: 0 0 2px 0 #505050;
      visibility: hidden;
    }

    input[type="range"].seek-bar::-ms-thumb {
      appearance: none;
      height: 0;
      width: 0;
      border-radius: 50%;
      background: #E8A03E;
      box-shadow: 0 0 2px 0 #505050;
      visibility: hidden;
    }

    /* Input Track */
    input[type="range"].seek-bar::-webkit-slider-runnable-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"].seek-bar::-moz-range-track {
      appearance: none;
      box-shadow: none;
      border: none;
      background: transparent;
    }

    input[type="range"].seek-bar::-ms-track {
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

    this.playerStyles.innerHTML += styles + externalStyles
  }

  applyCustomEventListeners(centralPlayButton: HTMLButtonElement) {
    centralPlayButton.classList.remove("hidden")

    this.midiPlayer.addEventListener("stop", () => {
      centralPlayButton.classList.remove("fadeOut")
      centralPlayButton.classList.add("fadeIn")
    })

    this.midiPlayer.addEventListener("start", () => {
      centralPlayButton.classList.remove("fadeIn")
      centralPlayButton.classList.add("fadeOut")

      this.isPlaying = true
    })

    centralPlayButton.addEventListener("click", () => {
      if (!this.midiPlayer.noteSequence) return
      if (this.midiPlayer.playing) this.midiPlayer.stop()
      else this.midiPlayer.start()
    })
  }

  applyCustomSeekBarEventListeners() {
    this.seekBarElement.addEventListener("input", (e) => {
      const time = (e.target as HTMLInputElement).value

      this.midiPlayer.currentTime = +time
      this.updateSeekBarPosition(+time)

      if (!this.playingFlag) {
        this.isPlaying = this.midiPlayer.playing
      }

      if (this.midiPlayer.player && this.midiPlayer.playing) {
        this.midiPlayer.stop()
      }

      this.pianoRoll.redrawWithNewTime(+time)

      if (this.playerProgress) {
        this.playerProgress.updateCurrentAreaRectanglePosition()
        this.playerProgress.updateProgressIndicatorPosition(
          this.midiPlayer.currentTime / this.midiPlayer.duration
        )
      }

      this.playingFlag = true
    })

    this.seekBarElement.addEventListener("change", () => {
      if (
        this.isPlaying &&
        (+this.seekBarElement.value).toFixed(6) !==
          this.midiPlayer.duration.toFixed(6)
      ) {
        this.midiPlayer.start()
      }
      this.playingFlag = false
    })
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
  }

  private generateLeftControls() {
    // Create left controls part
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
    playSVG.innerHTML = ""
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
    stopSVG.innerHTML = ""
    stopSVG.appendChild(playButtonPauseIcon)

    // Replace error icon
    const playButtonErrorIcon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    playButtonErrorIcon.setAttribute("width", "18")
    playButtonErrorIcon.setAttribute("height", "18")
    playButtonErrorIcon.setAttribute("viewBox", "0 0 18 18")
    playButtonErrorIcon.setAttribute("fill", "currentColor")
    playButtonErrorIcon.setAttribute("xmlns", "http://www.w3.org/2000/svg")

    const playButtonErrorPath = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    )
    playButtonErrorPath.setAttribute(
      "d",
      "M18 9C18 13.9706 13.9706 18 9 18C4.02944 18 0 13.9706 0 9C0 4.02944 4.02944 0 9 0C13.9706 0 18 4.02944 18 9ZM10.2 5.95V10.05C10.2 10.7127 9.66273 11.25 8.99999 11.25C8.33725 11.25 7.79999 10.7127 7.79999 10.05V5.95C7.79999 5.28726 8.33725 4.75 8.99999 4.75C9.66273 4.75 10.2 5.28726 10.2 5.95ZM8.99999 14.2C9.66273 14.2 10.2 13.6627 10.2 13C10.2 12.3372 9.66273 11.8 8.99999 11.8C8.33725 11.8 7.79999 12.3372 7.79999 13C7.79999 13.6627 8.33725 14.2 8.99999 14.2Z"
    )
    playButtonErrorPath.setAttribute("fill-rule", "evenodd")
    playButtonErrorPath.setAttribute("clip-rule", "evenodd")

    playButtonErrorIcon.appendChild(playButtonErrorPath)

    const errorSVG = this.playButton.querySelector(
      ".icon.error-icon"
    ) as HTMLSpanElement
    errorSVG.innerHTML = ""
    errorSVG.appendChild(playButtonErrorIcon)

    // Create mute button with volume control input
    this.muteButton.classList.add("mute-button")
    this.muteButton.setAttribute("aria-label", "Mute")
    this.muteButton.setAttribute("title", "Mute")
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

    this.sliderWrapper.classList.add("slider-wrapper")
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
    this.volumeSlider.classList.add("volume-slider")
    this.volumeSlider.setAttribute("autocomplete", "off")

    this.sliderWrapper.appendChild(this.volumeSlider)

    // Append mute button and volume slider to left controls
    this.controlsLeft.appendChild(this.muteButton)
    this.controlsLeft.appendChild(this.sliderWrapper)
  }

  private generateRightControls() {
    // Create right controls part
    this.controlsRight.setAttribute("part", "pianoroll-controls-right")

    // Create fullscreen button
    this.fullscreenButton.classList.add("button", "fullscreen-button")
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

  generateCustomSeekBar() {
    this.seekBarElement.setAttribute("type", "range")
    this.seekBarElement.setAttribute("min", "0")
    this.seekBarElement.max = this.midiPlayer.duration.toString()
    this.seekBarElement.setAttribute("value", "0")
    this.seekBarElement.setAttribute("step", "any")
    this.seekBarElement.classList.add("seek-bar")
    this.seekBarElement.setAttribute("part", "custom-seek-bar")
    this.controlsElement.appendChild(this.seekBarElement)
  }

  updateSeekBarPosition(newPosition: number) {
    const min = parseFloat(this.seekBarElement.min)
    const max = parseFloat(this.seekBarElement.max)
    const value = parseFloat(this.seekBarElement.value)
    const percentage = ((value - min) * 100) / (max - min)
    this.setVolumePercentage(percentage)

    this.seekBarElement.value = newPosition.toString()
  }

  createPlayerProgressRef(playerProgress: PlayerProgressController) {
    this.playerProgress = playerProgress
  }

  private setVolumePercentage(percentage: number) {
    this.seekBarElement.style.backgroundSize = `${percentage}% 100%`
  }
}

export default PlayerControls
