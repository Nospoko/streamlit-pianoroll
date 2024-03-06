import { MidiPlayerElement } from "./types"

class VolumeController {
  midiPlayer: MidiPlayerElement
  volumeInput: HTMLInputElement
  private isRTL: boolean

  constructor(midiPlayer: MidiPlayerElement, volumeInput: HTMLInputElement) {
    this.midiPlayer = midiPlayer
    this.volumeInput = volumeInput
    this.isRTL = document.documentElement.dir === "rtl"

    this.volumeInput.addEventListener(
      "input",
      this.handleInputChange.bind(this)
    )
    this.setupMutationObserver()
  }

  private handleInputChange(e: Event) {
    const target = e.target as HTMLInputElement
    const min = parseFloat(target.min)
    const max = parseFloat(target.max)
    const value = parseFloat(target.value)
    let percentage = ((value - min) * 100) / (max - min)
    if (this.isRTL) {
      percentage = max - value
    }

    target.setAttribute("aria-valuenow", Math.floor(value).toString())
    target.setAttribute("aria-valuetext", `${Math.floor(value)}dB volume`)
    target.style.backgroundSize = `${Math.floor(percentage)}% 100%`
    if (this.midiPlayer.player)
      this.midiPlayer.player.output.volume.value = value
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
}

export default VolumeController
