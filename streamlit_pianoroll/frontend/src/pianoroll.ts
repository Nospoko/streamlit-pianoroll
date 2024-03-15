import { Note, NoteSequence, NoteRectangleInfo } from "./types"
import { generateVelocityGradient, GradientStop } from "./color_generator"

class PianoRoll {
  svgElement: SVGSVGElement
  keyboardSvg: SVGSVGElement
  notesSvg: SVGSVGElement
  noteSequence: NoteSequence
  end: number
  duration_total: number
  pitchMin!: number
  pitchMax!: number
  pitchSpan!: number
  noteHeight!: number
  colormap: any
  secondaryColormap: any
  displayedNotes!: NoteRectangleInfo[]
  timeIndicator: SVGLineElement | null
  current_page_idx: number = 0
  max_single_page_duraion: number = 40
  target_page_duration: number = 20
  note_pages: NoteSequence[] = []
  page_duration: number = 40

  constructor(svgElement: SVGSVGElement, sequence: NoteSequence) {
    this.noteSequence = sequence
    this.svgElement = svgElement
    this.timeIndicator = null
    this.duration_total = sequence[sequence.length - 1].endTime
    this.end = 1

    this.notesSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )
    this.keyboardSvg = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg"
    )

    this.prepareSvg()

    this.initializeColors()
    this.preparePagination()
    this.drawPianoRoll()
  }

  private prepareSvg() {
    this.svgElement.setAttribute("viewBox", "0 0 1 1")
    this.svgElement.setAttribute("preserveAspectRatio", "none")

    this.notesSvg.setAttribute("width", "98%")
    this.notesSvg.setAttribute("height", "100%")
    this.notesSvg.setAttribute("x", "2%")

    this.notesSvg.innerHTML = ""
    this.notesSvg.setAttribute("viewBox", "0 0 1 1")
    this.notesSvg.setAttribute("preserveAspectRatio", "none")
    this.svgElement.appendChild(this.notesSvg)

    // Sub-SVG to draw the keyboard on
    this.keyboardSvg.setAttribute("width", "2%")
    this.keyboardSvg.setAttribute("height", "100%")

    this.keyboardSvg.innerHTML = ""
    this.keyboardSvg.setAttribute("viewBox", "0 0 1 1")
    this.keyboardSvg.setAttribute("preserveAspectRatio", "none")
    this.svgElement.appendChild(this.keyboardSvg)
  }

  private preparePagination() {
    // If there's too many, we'll divide them into pianoroll pages
    const notes = this.noteSequence

    if (this.duration_total <= this.max_single_page_duraion) {
      // It's a single-page piano-roll
      this.note_pages = [notes]
      this.page_duration = this.duration_total
    } else {
      let n_pages = this.duration_total / this.target_page_duration
      n_pages = Math.ceil(n_pages)
      this.page_duration = this.duration_total / n_pages
      for (let it = 0; it < n_pages; it++) {
        let page_start_time = it * this.page_duration
        let page_end_time = (it + 1) * this.page_duration
        let page_notes = notes.filter(
          (note) =>
            note.startTime >= page_start_time && note.startTime < page_end_time
        )

        this.note_pages.push(page_notes)
      }
    }

    console.log("N PAGES:", this.note_pages.length)
  }

  private initializeColors(): void {
    const mainColors: GradientStop[] = [
      { pos: 0, color: "#5db5d5" },
      { pos: 10, color: "#55a7c5" },
      { pos: 20, color: "#4c99b6" },
      { pos: 30, color: "#448ca7" },
      { pos: 40, color: "#3c7f98" },
      { pos: 50, color: "#347289" },
      { pos: 60, color: "#2c657b" },
      { pos: 70, color: "#24596c" },
      { pos: 80, color: "#1d4d5f" },
      { pos: 90, color: "#154151" },
      { pos: 100, color: "#154151" },
    ]
    this.colormap = generateVelocityGradient(mainColors)

    // Red version
    // const secondaryColors: GradientStop[] = [
    //   { pos: 0, color: "#944038" },
    //   { pos: 10, color: "#893b34" },
    //   { pos: 20, color: "#7e3730" },
    //   { pos: 30, color: "#73322c" },
    //   { pos: 40, color: "#692e28" },
    //   { pos: 50, color: "#5f2924" },
    //   { pos: 60, color: "#542520" },
    //   { pos: 70, color: "#4a201d" },
    //   { pos: 80, color: "#411c19" },
    //   { pos: 90, color: "#371815" },
    //   { pos: 100, color: "#371815" }
    // ];
    // Yellow version
    const secondaryColors: GradientStop[] = [
      { pos: 0, color: "#f4d1a4" },
      { pos: 10, color: "#f3cc99" },
      { pos: 20, color: "#f2c78e" },
      { pos: 30, color: "#f1c183" },
      { pos: 40, color: "#f0bc78" },
      { pos: 50, color: "#efb76d" },
      { pos: 60, color: "#eeb262" },
      { pos: 70, color: "#ecad56" },
      { pos: 80, color: "#eba74b" },
      { pos: 90, color: "#e9a23f" },
      { pos: 100, color: "#e9a23f" },
    ]

    this.secondaryColormap = generateVelocityGradient(secondaryColors)
  }

  public drawPianoRoll(): void {
    const sequence = this.note_pages[this.current_page_idx]

    this.end = sequence[sequence.length - 1].endTime

    const pitches = sequence.map((note) => note.pitch)

    this.pitchMin = Math.min(...pitches)
    this.pitchMax = Math.max(...pitches)
    this.pitchSpan = this.pitchMax - this.pitchMin

    if (this.pitchSpan < 24) {
      const diff = 24 - this.pitchSpan
      this.pitchMin -= Math.ceil(diff / 2)
      this.pitchMax += Math.floor(diff / 2)
    }

    this.pitchMin -= 3
    this.pitchMax += 3
    this.pitchSpan = this.pitchMax - this.pitchMin
    this.noteHeight = 1 / this.pitchSpan

    this.drawKeyboard(this.pitchMin, this.pitchMax)
    this.drawEmptyPianoRoll(this.pitchMin, this.pitchMax)

    this.drawNotes(sequence)

    // Time indicator
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", "0")
    line.setAttribute("y1", "0")
    line.setAttribute("x2", "0")
    line.setAttribute("y2", "1")
    line.setAttribute("stroke", "#E8A03E")
    line.setAttribute("stroke-width", "0.002")
    this.timeIndicator = line
    this.notesSvg.appendChild(this.timeIndicator)
  }

  private updateCurrentPageIdx(current_time: number): void {
    // Find the current page
    const page_index = Math.floor(current_time / this.page_duration)
    if (page_index !== this.current_page_idx) {
      this.current_page_idx = page_index

      // Using this as a cleaup method
      this.prepareSvg()

      // Redraw the new page
      this.drawPianoRoll()
    }

    // Current redraw
  }

  public redrawWithNewTime(currentTime: number): void {
    this.updateCurrentPageIdx(currentTime)

    // Transform time to x coordinate
    const new_x = this.timeToX(currentTime)

    // Move the time bar
    if (this.timeIndicator) {
      this.timeIndicator.setAttribute("x1", `${new_x}`)
      this.timeIndicator.setAttribute("x2", `${new_x}`)
    }

    // To make the rectangle grow symmetrically, we have
    // to move it half of the growth in the other direction
    const height_gain = this.noteHeight * 0.8
    const new_height = this.noteHeight + height_gain

    // Change colors for playing notes
    this.displayedNotes.forEach((note) => {
      if (note.x_left <= new_x && note.x_right > new_x) {
        // This class controls the transition rate (see note-noteRectangle.active css)
        note.noteRectangle.classList.add("active")

        // Make it dance
        const new_y = note.y - height_gain / 2
        note.noteRectangle.setAttribute("y", `${new_y}`)
        note.noteRectangle.setAttribute("height", `${new_height}`)
      } else if (note.x_right < new_x) {
        note.noteRectangle.classList.remove("active")

        // Bring back to default look
        note.noteRectangle.setAttribute("fill", note.velocity_color)
        note.noteRectangle.setAttribute("height", `${note.height}`)
        note.noteRectangle.setAttribute("y", `${note.y}`)
      }
    })
  }

  private timeToX(time: number): number {
    // Offset Pagination
    const offset = this.page_duration * this.current_page_idx
    return (time - offset) / this.page_duration
  }

  private durationToWidth(duration: number): number {
    // Offset Pagination
    return duration / this.page_duration
  }

  public drawEmptyPianoRoll(pitchMin: number, pitchMax: number): void {
    const pitchSpan = pitchMax - pitchMin
    for (let it = pitchMin; it <= pitchMax + 1; it++) {
      const y = 1 - (it - pitchMin) / pitchSpan
      const height = 1 / pitchSpan

      // Draw black keys
      if ([1, 3, 6, 8, 10].includes(it % 12)) {
        this.drawBlackKeyBackground(y, height, this.notesSvg)
      }

      // Draw key separator lines
      this.drawKeySeparator(y + height, it % 12 === 0, this.notesSvg)
    }
  }

  private drawNotes(sequence: NoteSequence): void {
    this.displayedNotes = []
    sequence.forEach((note: Note) => {
      const noteRectangleInfo = this.createNoteRectangle(note)

      this.notesSvg.appendChild(noteRectangleInfo.noteRectangle)
      this.displayedNotes.push(noteRectangleInfo)
    })
  }

  private createNoteRectangle(note: Note): NoteRectangleInfo {
    const noteRectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    )
    const x = this.timeToX(note.startTime)
    const w = this.durationToWidth(note.endTime - note.startTime)
    const y = 1 - (note.pitch - this.pitchMin) / (this.pitchMax - this.pitchMin)

    let color
    if (note.colorId === 0 || note.colorId === undefined) {
      color = this.colormap[note.velocity]
    } else {
      color = this.secondaryColormap[note.velocity]
    }

    noteRectangle.setAttribute("x", `${x}`)
    noteRectangle.setAttribute("width", `${w}`)
    noteRectangle.setAttribute("y", `${y}`)
    noteRectangle.setAttribute("height", `${this.noteHeight}`)
    noteRectangle.setAttribute("fill", color)
    noteRectangle.classList.add("note-rectangle")

    // Store it
    let trackedNote = {
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

  private drawBlackKeyBackground(
    y: number,
    height: number,
    element: SVGSVGElement
  ): void {
    const rect = this.createRectangle(0, y, 1, height, "WhiteSmoke", 0.666)
    element.appendChild(rect)
  }

  private drawKeySeparator(
    y: number,
    isOctave: boolean,
    element: SVGSVGElement
  ): void {
    const line = this.createLine(0, y, 2, y, isOctave ? 0.003 : 0.001)
    element.appendChild(line)
  }

  private createRectangle(
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    fillOpacity: number
  ): SVGRectElement {
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect")
    rect.setAttribute("x", `${x}`)
    rect.setAttribute("y", `${y}`)
    rect.setAttribute("width", `${width}`)
    rect.setAttribute("height", `${height}`)
    rect.setAttribute("fill", fill)
    rect.setAttribute("fill-opacity", `${fillOpacity}`)
    return rect
  }

  private createLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    strokeWidth: number,
    color: string = "black"
  ): SVGLineElement {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
    line.setAttribute("x1", `${x1}`)
    line.setAttribute("y1", `${y1}`)
    line.setAttribute("x2", `${x2}`)
    line.setAttribute("y2", `${y2}`)
    line.setAttribute("stroke-width", `${strokeWidth}`)
    line.setAttribute("stroke", "black")
    return line
  }

  drawKeyboard(pitch_min: number, pitch_max: number) {
    const pitch_span = pitch_max - pitch_min
    for (let it = pitch_min; it <= pitch_max + 1; it++) {
      // Black keys
      if ([1, 3, 6, 8, 10].includes(it % 12)) {
        const rect = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "rect"
        )
        const y = 1 - (it - pitch_min) / pitch_span
        const x = 0
        const h = 1 / pitch_span
        const w = 1

        rect.setAttribute("fill", "black")
        rect.setAttribute("x", `${x}`)
        rect.setAttribute("y", `${y}`)
        rect.setAttribute("width", `${w}`)
        rect.setAttribute("height", `${h}`)
        this.keyboardSvg.appendChild(rect)
      }

      // Key separation
      var line = document.createElementNS("http://www.w3.org/2000/svg", "line")
      const y = 1 - (it - pitch_min) / pitch_span + 1 / pitch_span
      line.setAttribute("x1", "0")
      line.setAttribute("y1", `${y}`)
      line.setAttribute("x2", "2")
      line.setAttribute("y2", `${y}`)
      let line_width

      // Every octave, line is bolder
      if (it % 12 === 0) {
        line_width = 0.003
      } else {
        line_width = 0.001
      }
      line.setAttribute("stroke-width", `${line_width}`)
      line.setAttribute("stroke", "black")
      this.keyboardSvg.appendChild(line)
    }

    var line2 = document.createElementNS("http://www.w3.org/2000/svg", "line2")
    line2.setAttribute("x1", "0.99")
    line2.setAttribute("y1", "0")
    line2.setAttribute("x2", "0.99")
    line2.setAttribute("y2", "1")
    line2.setAttribute("stroke-width", "0.01")
    line2.setAttribute("stroke", "black")
    this.keyboardSvg.appendChild(line2)

    var line3 = document.createElementNS("http://www.w3.org/2000/svg", "line3")
    line3.setAttribute("x1", "0")
    line3.setAttribute("y1", "0")
    line3.setAttribute("x2", "0")
    line3.setAttribute("y2", "1")
    line3.setAttribute("stroke-width", "0.01")
    line3.setAttribute("stroke", "black")
    this.keyboardSvg.appendChild(line3)
  }

  drawProgressTimeline(
    progressBar: SVGSVGElement,
    progressIndicator: SVGLineElement
  ) {
    this.drawEmptyProgressTimeline(this.pitchMin, this.pitchMax, progressBar)

    for (
      let current_page_idx = 0;
      current_page_idx < this.note_pages.length;
      current_page_idx++
    ) {
      const sequence = this.note_pages[current_page_idx]
      const sequenceSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      )

      sequenceSvg.innerHTML = ""
      sequenceSvg.setAttribute("width", "100%")
      sequenceSvg.setAttribute("height", "100%")
      sequenceSvg.setAttribute("viewBox", `0 0 ${this.note_pages.length} 1`)
      sequenceSvg.setAttribute("preserveAspectRatio", "none")

      sequence.forEach((note: Note) => {
        const noteRectangleInfo = this.createNoteRectangle(note)
        sequenceSvg.appendChild(noteRectangleInfo.noteRectangle)
      })

      progressBar.appendChild(sequenceSvg)
    }

    const currentAreaRectangle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    )
    currentAreaRectangle.id = "current-area-rectangle"
    currentAreaRectangle.setAttribute("x", "0")
    currentAreaRectangle.setAttribute("y", "0")
    currentAreaRectangle.setAttribute(
      "width",
      `${100 / this.note_pages.length}%`
    )
    currentAreaRectangle.setAttribute("height", "100%")
    currentAreaRectangle.setAttribute("stroke", "grey")
    currentAreaRectangle.setAttribute("stroke-width", "0.002")
    currentAreaRectangle.setAttribute("fill", "WhiteSmoke")
    currentAreaRectangle.setAttribute("fill-opacity", "0.5")

    progressBar.appendChild(currentAreaRectangle)
    progressBar.appendChild(progressIndicator)
  }

  drawEmptyProgressTimeline(
    pitchMin: number,
    pitchMax: number,
    progressBar: SVGSVGElement
  ): void {
    const pitchSpan = pitchMax - pitchMin
    for (let it = pitchMin; it <= pitchMax + 1; it++) {
      const y = 1 - (it - pitchMin) / pitchSpan
      const height = 1 / pitchSpan

      // Draw black keys
      if ([1, 3, 6, 8, 10].includes(it % 12)) {
        this.drawBlackKeyBackground(y, height, progressBar)
      }

      // Draw key separator lines
      this.drawKeySeparator(y + height, it % 12 === 0, progressBar)
    }
  }

  updateCurrentAreaRectanglePosition() {
    const currentAreaRectangle = document.querySelector(
      "#current-area-rectangle"
    ) as SVGRectElement

    currentAreaRectangle.setAttribute(
      "x",
      `${(100 / this.note_pages.length) * this.current_page_idx}%`
    )
  }
}

export default PianoRoll
