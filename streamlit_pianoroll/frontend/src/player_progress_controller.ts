import { MidiPlayerElement } from "./types"

class PlayerProgressController {
  midiPlayer: MidiPlayerElement
  progressLine: SVGLineElement
  progressBarSVG: SVGElement

  constructor(
    midiPlayer: MidiPlayerElement,
    progressLine: SVGLineElement,
    progressBarSVG: SVGElement
  ) {
    this.midiPlayer = midiPlayer
    this.progressLine = progressLine
    this.progressBarSVG = progressBarSVG

    this.progressBarSVG.addEventListener("mousedown", this.onMouseDown)
    this.progressBarSVG.addEventListener("touchstart", this.onTouchDown)
  }

  private onMouseDown = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)

    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  private onTouchDown = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.setNewPosition(touch.clientX)

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

    this.startPlayer()
  }

  private onTouchEnd = () => {
    document.removeEventListener("touchmove", this.onTouchMove)
    document.removeEventListener("touchend", this.onTouchEnd)

    this.startPlayer()
  }

  private setNewPosition(pos: number) {
    const lineOffset = 3
    const svgBounding = this.progressBarSVG.getBoundingClientRect()
    const calcPos = (pos - lineOffset) / svgBounding.width
    const newPosition = Math.min(Math.max(calcPos, 0), 1)

    this.progressLine.setAttribute("x1", newPosition.toString())
    this.progressLine.setAttribute("x2", newPosition.toString())

    this.midiPlayer.stop()
    this.midiPlayer.currentTime = newPosition * this.midiPlayer.duration
  }

  private startPlayer() {
    if (
      this.midiPlayer.currentTime.toFixed(2) ===
      this.midiPlayer.duration.toFixed(2)
    )
      return

    setTimeout(() => {
      this.midiPlayer.start()
    }, 100)
  }
}

export default PlayerProgressController
