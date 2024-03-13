import { MidiPlayerElement } from "./types"

class VolumeController {
  midiPlayer: MidiPlayerElement
  volumeInput: HTMLInputElement
  muteButton: HTMLButtonElement
  private volumeState: "mute" | "unmute"
  private volumePercentage: number
  private volumeValue: number
  private isRTL: boolean

  constructor(
    midiPlayer: MidiPlayerElement,
    volumeInput: HTMLInputElement,
    muteButton: HTMLButtonElement
  ) {
    this.midiPlayer = midiPlayer
    this.volumeInput = volumeInput
    this.muteButton = muteButton
    this.volumeState = "unmute"
    // this.volumePercentage = 85
    // this.volumeValue = -3
    this.isRTL = document.documentElement.dir === "rtl"

    const min = parseFloat(this.volumeInput.min)
    const max = parseFloat(this.volumeInput.max)
    this.volumeValue = parseFloat(this.volumeInput.value)
    this.volumePercentage = ((this.volumeValue - min) * 100) / (max - min)
    this.setVolumePercentage(this.volumeInput, this.volumePercentage)

    this.volumeInput.addEventListener(
      "input",
      this.handleInputChange.bind(this)
    )
    this.setupMutationObserver()

    this.muteButton.addEventListener("click", this.handleMuteButton.bind(this))
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    const min = parseFloat(target.min)
    const max = parseFloat(target.max)
    this.volumeValue = parseFloat(target.value)
    this.volumePercentage = ((this.volumeValue - min) * 100) / (max - min)

    if (this.isRTL) {
      this.volumePercentage = max - this.volumeValue
    }

    const stringValue = Math.floor(this.volumeValue).toString()
    target.setAttribute("aria-valuenow", stringValue)
    target.setAttribute("aria-valuetext", `${stringValue}dB volume`)
    target.style.backgroundSize = `${Math.floor(this.volumePercentage)}% 100%`

    this.setVolumeValue(this.volumeValue)
    this.handleIconChange(this.volumePercentage)
  }

  private callback(mutationList: MutationRecord[], observer: MutationObserver) {
    mutationList.forEach((mutation: MutationRecord) => {
      if (mutation.type === "attributes" && mutation.attributeName === "dir") {
        this.isRTL = (mutation.target as HTMLElement).dir === "rtl"
      }
    }, this)
  }

  private setupMutationObserver() {
    const observer: MutationObserver = new MutationObserver(
      this.callback.bind(this)
    )
    observer.observe(document.documentElement, { attributes: true })
  }

  private setVolumeValue(value: number) {
    if (this.midiPlayer.player)
      this.midiPlayer.player.output.volume.value = value
  }

  private setVolumePercentage(element: HTMLInputElement, percentage: number) {
    element.style.backgroundSize = `${Math.floor(percentage)}% 100%`
  }

  private handleMuteButton() {
    if (this.volumePercentage === 0) {
      this.volumePercentage = 100
      this.volumeValue = 5
      this.volumeState = "mute"
    }

    if (this.volumeState === "mute") {
      this.muteButton.title = "Mute"
      this.muteButton.ariaLabel = "Mute"
      this.handleIconChange(this.volumePercentage)
      this.setVolumeValue(this.volumeValue)
      this.volumeInput.value = `${this.volumeValue}`
      this.setVolumePercentage(this.volumeInput, this.volumePercentage)
      this.volumeState = "unmute"
    } else {
      this.muteButton.title = "Unmute"
      this.muteButton.ariaLabel = "Unmute"
      this.handleIconChange(0)
      this.setVolumeValue(-50)
      this.volumeInput.value = "-50"
      this.setVolumePercentage(this.volumeInput, 0)
      this.volumeState = "mute"
    }
  }

  private handleIconChange(percentage: number) {
    const muteButtonIcon = this.muteButton.firstElementChild as SVGElement

    const volumeOffIcon = `<path fill="currentColor" d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63m2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9zM12 4 9.91 6.09 12 8.18z"></path>`

    const volumeDownIcon = `<path fill="currentColor" d="M16.5 12C16.5 10.23 15.48 8.71 14 7.97V16.02C15.48 15.29 16.5 13.77 16.5 12ZM3 9V15H7L12 20V4L7 9H3Z"></path>`

    const volumeOnIcon = `<path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"></path>`

    if (percentage === 0) muteButtonIcon.innerHTML = volumeOffIcon
    else if (percentage > 0 && percentage <= 50)
      muteButtonIcon.innerHTML = volumeDownIcon
    else if (percentage > 50) muteButtonIcon.innerHTML = volumeOnIcon
  }
}

export default VolumeController
