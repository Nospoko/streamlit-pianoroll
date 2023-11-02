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
  // Add text and a button to the DOM. (You could also add these directly
  // to index.html.)
  const button = document.getElementById("my-button")!;
  // button.textContent = "Click Me NOW!"

  const player = document.getElementById("my-midi-player")! as MidiPlayerElement;

  player.addEventListener('start', () => {
    console.log("EVENT!");
    Streamlit.setFrameHeight()
  }, false);

  player.addEventListener('load', () => {
    console.log("LOAD EVENT!");
    Streamlit.setFrameHeight()
  }, false);

  // Add a click handler to our button. It will send data back to Streamlit.
  let numClicks = 0

  button.onclick = function(): void {
    // Increment numClicks, and pass the new value back to
    // Streamlit via `Streamlit.setComponentValue`.
    numClicks += 1
    Streamlit.setComponentValue(numClicks)

    const svg = document.getElementById("mySvg");
    if (svg && svg instanceof SVGSVGElement) {
      drawCircleOnSVG(svg);
    }
  }
}

export function onStreamlitRender(event: Event): void {
  // Get the RenderData from the event
  const data = (event as CustomEvent<RenderData>).detail

  // Maintain compatibility with older versions of Streamlit that don't send
  // a theme object.
  const button = document.getElementById("my-button")! as HTMLButtonElement;

  // Disable our button if necessary.
  button.disabled = data.disabled

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
