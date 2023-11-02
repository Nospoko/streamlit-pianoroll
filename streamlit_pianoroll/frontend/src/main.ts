import { Streamlit, RenderData } from "streamlit-component-lib"


interface MidiPlayerElement extends HTMLElement {
  noteSequence?: any; // replace any with the actual type if known
  addVisualizer(visualizer: MidiVisualizerElement): void;
}

interface MidiVisualizerElement extends HTMLElement {
  noteSequence?: any; // replace any with the actual type if known
  reload(): void;
}

function drawCircleOnSVG(svg: SVGSVGElement): void {
  const circle = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  )
  circle.setAttribute("cx", "50")
  circle.setAttribute("cy", "50")
  circle.setAttribute("r", "40")
  circle.setAttribute("fill", "tomato")
  svg.appendChild(circle)
}

export function afterContentLoaded() {
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;

  player.addEventListener('start', () => {
    console.log("EVENT!");
    Streamlit.setFrameHeight()
  }, false);

  player.addEventListener('load', () => {
    console.log("LOAD EVENT!");
    Streamlit.setFrameHeight()
  }, false);
}

export function onStreamlitRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  // RenderData.args is the JSON dictionary of arguments sent from the
  // Python script.
  // let name = data.args["name"]

  let note_sequence = data.args["note_sequence"]
  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;
  player.noteSequence = note_sequence;

  const visualizer = document.getElementById("my-visualizer")! as MidiVisualizerElement;
  visualizer.noteSequence = note_sequence;
  player.addVisualizer(visualizer);
}
