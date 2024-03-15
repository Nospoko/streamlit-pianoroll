import PianoRoll from "./pianoroll"
import { MidiPlayerElement, PianoRollSvgVisualizer } from "./types"

class PlayerProgressController {
  midiPlayer: MidiPlayerElement
  progressIndicator: SVGLineElement
  progressBarSVG: SVGSVGElement
  pianoRoll: PianoRoll
  pianoRollSvgVisualizer: PianoRollSvgVisualizer
  isPlaying: boolean

  constructor(
    midiPlayer: MidiPlayerElement,
    progressIndicator: SVGLineElement,
    progressBarSVG: SVGSVGElement,
    pianoRoll: any,
    pianoRollSvgVisualizer: any
  ) {
    this.midiPlayer = midiPlayer
    this.progressIndicator = progressIndicator
    this.progressBarSVG = progressBarSVG
    this.pianoRoll = pianoRoll
    this.pianoRollSvgVisualizer = pianoRollSvgVisualizer
    this.isPlaying = this.midiPlayer.playing

    // console.log(this.pianoRoll)
    // console.log(this.pianoRollSvgVisualizer)

    this.pianoRollSvgVisualizer.redraw = (noteDetails: any) => {
      const currentTime = noteDetails.startTime
      pianoRoll.redrawWithNewTime(currentTime)
      const newPosition = currentTime / this.midiPlayer.duration

      this.updateProgressIndicatorPosition(newPosition)

      this.pianoRoll.updateCurrentAreaRectanglePosition()
    }

    this.pianoRoll.drawProgressTimeline(
      this.progressBarSVG,
      this.progressIndicator
    )

    this.progressBarSVG.addEventListener("mousedown", this.onMouseDown)
    this.progressBarSVG.addEventListener("touchstart", this.onTouchDown)
  }

  private onMouseDown = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)

    this.isPlaying = this.midiPlayer.playing
    this.midiPlayer.stop()

    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  private onTouchDown = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.setNewPosition(touch.clientX)

    this.isPlaying = this.midiPlayer.playing
    this.midiPlayer.stop()

    document.addEventListener("touchmove", this.onTouchMove)
    document.addEventListener("touchend", this.onTouchEnd)
  }

  private onMouseMove = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)
  }

  private onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.setNewPosition(touch.clientX)
  }

  private onMouseUp = () => {
    document.removeEventListener("mousemove", this.onMouseMove)
    document.removeEventListener("mouseup", this.onMouseUp)

    if (this.isPlaying) this.startPlayer()
  }

  private onTouchEnd = () => {
    document.removeEventListener("touchmove", this.onTouchMove)
    document.removeEventListener("touchend", this.onTouchEnd)

    if (this.isPlaying) this.startPlayer()
  }

  private setNewPosition(pos: number) {
    if (!this.midiPlayer.duration) return

    const lineOffset = 3
    const svgBounding = this.progressBarSVG.getBoundingClientRect()
    const calcPos = (pos - lineOffset) / svgBounding.width
    const newPosition = Math.min(Math.max(calcPos, 0.001), 0.999)
    const currentTime =
      Math.min(Math.max(calcPos, 0), 1) * this.midiPlayer.duration

    this.updateProgressIndicatorPosition(newPosition)

    this.midiPlayer.currentTime = currentTime

    if (
      this.midiPlayer.currentTime.toFixed(2) ===
      this.midiPlayer.duration.toFixed(2)
    )
      return

    this.pianoRoll.redrawWithNewTime(currentTime)
    this.pianoRoll.updateCurrentAreaRectanglePosition()
  }

  private startPlayer() {
    if (
      this.midiPlayer.currentTime.toFixed(2) ===
        this.midiPlayer.duration.toFixed(2) ||
      !this.midiPlayer.duration
    )
      return

    this.midiPlayer.start()
  }

  private updateProgressIndicatorPosition(newPosition: number) {
    this.progressIndicator.setAttribute("x1", newPosition.toString())
    this.progressIndicator.setAttribute("x2", newPosition.toString())
  }
}

export default PlayerProgressController
