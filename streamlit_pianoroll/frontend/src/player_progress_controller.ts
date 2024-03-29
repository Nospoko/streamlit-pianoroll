import PianoRoll from "./pianoroll"
import PlayerControls from "./player_controls"
import { Note, NoteRectangleInfo, NoteSequence } from "./types"

class PlayerProgressController {
  playerControls: PlayerControls
  progressBarSVG: SVGSVGElement
  progressIndicator: SVGLineElement
  currentAreaRectangle: SVGRectElement
  pianoRoll: PianoRoll
  isPlaying: boolean
  parent: HTMLDivElement
  pitchMin!: number
  pitchMax!: number
  pitchSpan!: number
  noteHeight!: number

  constructor(
    playerControls: PlayerControls,
    pianoRoll: PianoRoll,
    parent: HTMLDivElement
  ) {
    this.playerControls = playerControls
    this.pianoRoll = pianoRoll
    this.parent = parent
    this.isPlaying = this.playerControls.midiPlayer.playing

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

    this.playerControls.createPlayerProgressRef(this)

    this.calcPitches()
    this.drawEmptyProgressTimeline()
    this.drawCurrentAreaRectangle()
    this.drawProgressIndicator()

    this.progressBarSVG.addEventListener("mousedown", this.onMouseDown)
    this.progressBarSVG.addEventListener("touchstart", this.onTouchDown)
  }

  private onMouseDown = (e: MouseEvent) => {
    this.setNewPosition(e.clientX)

    this.isPlaying = this.playerControls.midiPlayer.playing
    if (this.isPlaying) this.playerControls.midiPlayer.stop()

    document.addEventListener("mousemove", this.onMouseMove)
    document.addEventListener("mouseup", this.onMouseUp)
  }

  private onTouchDown = (e: TouchEvent) => {
    const touch = e.touches[0]
    this.setNewPosition(touch.clientX)

    this.isPlaying = this.playerControls.midiPlayer.playing
    if (this.isPlaying) this.playerControls.midiPlayer.stop()

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
    if (!this.playerControls.midiPlayer.duration) return

    const lineOffset = 3
    const svgBounding = this.progressBarSVG.getBoundingClientRect()
    const calcPos = (pos - lineOffset) / svgBounding.width
    const newPosition = Math.min(Math.max(calcPos, 0.001), 0.999)
    const currentTime =
      Math.min(Math.max(calcPos, 0), 1) *
      this.playerControls.midiPlayer.duration

    this.updateProgressIndicatorPosition(newPosition)
    this.playerControls.updateSeekBarPosition(currentTime)

    this.playerControls.midiPlayer.currentTime = currentTime

    if (
      this.playerControls.midiPlayer.currentTime.toFixed(2) ===
      this.playerControls.midiPlayer.duration.toFixed(2)
    )
      return

    this.pianoRoll.redrawWithNewTime(currentTime)
    this.updateCurrentAreaRectanglePosition()
  }

  private startPlayer() {
    if (
      this.playerControls.midiPlayer.currentTime.toFixed(2) ===
        this.playerControls.midiPlayer.duration.toFixed(2) ||
      !this.playerControls.midiPlayer.duration
    )
      return

    setTimeout(() => {
      this.playerControls.midiPlayer.start()
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

    for (
      let current_page_idx = 0;
      current_page_idx < this.pianoRoll.note_pages.length;
      current_page_idx++
    ) {
      const sequence = this.pianoRoll.note_pages[current_page_idx]

      sequence.forEach((note: Note) => {
        const noteRectangleInfo = this.createNoteRectangle(note)
        this.progressBarSVG.appendChild(noteRectangleInfo.noteRectangle)
      })
    }

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

  createNoteRectangle(note: Note): NoteRectangleInfo {
    const noteRectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    )
    const x = this.timeToX(note.startTime)
    const w = this.durationToWidth(note.endTime - note.startTime)
    const y = 1 - (note.pitch - this.pitchMin) / this.pitchSpan

    const color = this.pianoRoll.colormap[note.velocity]

    noteRectangle.setAttribute("x", `${x}`)
    noteRectangle.setAttribute("width", `${w}`)
    noteRectangle.setAttribute("y", `${y}`)
    noteRectangle.setAttribute("height", `${this.noteHeight}`)
    noteRectangle.setAttribute("fill", color)
    noteRectangle.classList.add("note-rectangle")

    // Store it
    const trackedNote = {
      noteRectangle: noteRectangle,
      velocity_color: color,
      y: y,
      x_left: x,
      x_right: x + w,
      width: w,
      height: this.noteHeight,
    }

    return trackedNote
  }

  calcPitches() {
    // Calc the global pitch values for all sequences to display them in one line
    const emptyArray = [] as NoteSequence
    const allSequences = emptyArray.concat(...this.pianoRoll.note_pages)

    const pitches = allSequences.map((note) => note.pitch)

    this.pitchMin = Math.min(...pitches)
    this.pitchMax = Math.max(...pitches)

    if (this.pitchSpan < 24) {
      const diff = 24 - this.pitchSpan
      this.pitchMin -= Math.ceil(diff / 2)
      this.pitchMax += Math.floor(diff / 2)
    }

    this.pitchMin -= 3
    this.pitchMax += 3
    this.pitchSpan = this.pitchMax - this.pitchMin
    this.noteHeight = 1 / this.pitchSpan
  }

  timeToX(time: number) {
    return time / this.pianoRoll.duration_total
  }

  durationToWidth(duration: number) {
    // Offset Pagination
    return duration / this.pianoRoll.duration_total
  }
}

export default PlayerProgressController
