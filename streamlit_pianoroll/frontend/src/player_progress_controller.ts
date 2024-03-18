import PianoRoll from "./pianoroll"
import { MidiPlayerElement, Note } from "./types"

class PlayerProgressController {
  midiPlayer: MidiPlayerElement
  progressBarSVG: SVGSVGElement
  progressIndicator: SVGLineElement
  currentAreaRectangle: SVGRectElement
  pianoRoll: PianoRoll
  isPlaying: boolean
  parent: HTMLDivElement

  constructor(
    midiPlayer: MidiPlayerElement,
    pianoRoll: PianoRoll,
    parent: HTMLDivElement
  ) {
    this.midiPlayer = midiPlayer
    this.pianoRoll = pianoRoll
    this.parent = parent
    this.isPlaying = this.midiPlayer.playing

    this.progressBarSVG = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    this.progressIndicator = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    )
    this.currentAreaRectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    )

    this.drawEmptyProgressTimeline()
    this.drawCurrentAreaRectangle()
    this.drawProgressIndicator()

    this.progressBarSVG.addEventListener("mousedown", this.onMouseDown)
    this.progressBarSVG.addEventListener("touchstart", this.onTouchDown)
  }

  private onMouseDown = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)

    this.isPlaying = this.midiPlayer.playing
    if (this.isPlaying) this.midiPlayer.stop()

    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  private onTouchDown = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.setNewPosition(touch.clientX)

    this.isPlaying = this.midiPlayer.playing
    if (this.isPlaying) this.midiPlayer.stop()

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
    this.updateCurrentAreaRectanglePosition()
  }

  private startPlayer() {
    if (
      this.midiPlayer.currentTime.toFixed(2) ===
        this.midiPlayer.duration.toFixed(2) ||
      !this.midiPlayer.duration
    )
      return

    setTimeout(() => {
      this.midiPlayer.start()
    }, 50)
  }

  updateProgressIndicatorPosition(newPosition: number) {
    this.progressIndicator.setAttribute("x1", newPosition.toString())
    this.progressIndicator.setAttribute("x2", newPosition.toString())
  }

  private drawProgressIndicator() {
    this.progressIndicator.setAttribute("x1", "0.001")
    this.progressIndicator.setAttribute("y1", "0")
    this.progressIndicator.setAttribute("x2", "0.001")
    this.progressIndicator.setAttribute("y2", "1")
    this.progressIndicator.setAttribute("stroke", "#E8A03E")
    this.progressIndicator.setAttribute("stroke-width", "0.002")
    this.progressBarSVG.appendChild(this.progressIndicator)
  }

  private drawCurrentAreaRectangle() {
    const rectWidth = 100 / this.pianoRoll.note_pages.length
    this.currentAreaRectangle.id = "current-area-rectangle"
    this.currentAreaRectangle.setAttribute("x", "0")
    this.currentAreaRectangle.setAttribute("y", "0")
    this.currentAreaRectangle.setAttribute("width", `${rectWidth}%`)
    this.currentAreaRectangle.setAttribute("height", "100%")
    this.currentAreaRectangle.setAttribute("stroke", "grey")
    this.currentAreaRectangle.setAttribute("stroke-width", "0.002")
    this.currentAreaRectangle.setAttribute("fill", "WhiteSmoke")
    this.currentAreaRectangle.setAttribute("fill-opacity", "0.5")
    this.progressBarSVG.appendChild(this.currentAreaRectangle)
  }

  private drawProgressTimeline() {
    this.pianoRoll.drawEmptyPianoRoll(
      this.pianoRoll.pitchMin,
      this.pianoRoll.pitchMax,
      this.progressBarSVG
    )

    const sequenceSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    sequenceSvg.innerHTML = ""
    sequenceSvg.setAttribute("width", `100%`)
    sequenceSvg.setAttribute("height", "100%")
    sequenceSvg.setAttribute(
      "viewBox",
      `0 0 ${this.pianoRoll.note_pages.length} 1`
    )
    sequenceSvg.setAttribute("preserveAspectRatio", "none")

    for (
      let current_page_idx = 0;
      current_page_idx < this.pianoRoll.note_pages.length;
      current_page_idx++
    ) {
      const sequence = this.pianoRoll.note_pages[current_page_idx]

      sequence.forEach((note: Note) => {
        const noteRectangleInfo = this.pianoRoll.createNoteRectangle(note)
        sequenceSvg.appendChild(noteRectangleInfo.noteRectangle)
      })
    }

    this.progressBarSVG.appendChild(sequenceSvg)
    this.progressBarSVG.appendChild(this.progressIndicator)
  }

  updateCurrentAreaRectanglePosition() {
    const percentage = 100 / this.pianoRoll.note_pages.length
    const offset = percentage * this.pianoRoll.current_page_idx
    this.currentAreaRectangle.setAttribute("x", `${offset}%`)
  }

  private drawEmptyProgressTimeline() {
    const progressBarWrapper = document.createElement("div")
    progressBarWrapper.classList.add("pianoroll-progress-bar-wrapper")

    this.progressBarSVG.id = "progress-bar"
    this.progressBarSVG.classList.add("pianoroll-progress-bar")
    this.progressBarSVG.setAttribute("width", "100%")
    this.progressBarSVG.setAttribute("viewBox", "0 0 1 1")
    this.progressBarSVG.setAttribute("preserveAspectRatio", "none")

    progressBarWrapper.appendChild(this.progressBarSVG)
    this.parent.appendChild(progressBarWrapper)

    this.drawProgressTimeline()
  }
}

export default PlayerProgressController
