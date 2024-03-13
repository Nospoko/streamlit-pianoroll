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
  }

  private onMouseDown = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)

    this.progressBarSVG.addEventListener("mousemove", this.onMouseMove)
    this.progressBarSVG.addEventListener("mouseup", this.onMouseUp)
  }

  private onMouseMove = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)
  }

  private onMouseUp = () => {
    this.progressBarSVG.removeEventListener("mousemove", this.onMouseMove)
    this.progressBarSVG.removeEventListener("mouseup", this.onMouseUp)
  }

  private setNewPosition(pos: number) {
    const lineOffset = 3
    const svgBounding = this.progressBarSVG.getBoundingClientRect()
    const newPosition = ((pos - lineOffset) / svgBounding.width).toFixed(2)

    this.progressLine.setAttribute("x1", newPosition)
    this.progressLine.setAttribute("x2", newPosition)

    this.midiPlayer.currentTime = +newPosition * this.midiPlayer.duration
    console.log(this.midiPlayer.currentTime)
    console.log(this.midiPlayer.duration)
  }
}

export default PlayerProgressController
