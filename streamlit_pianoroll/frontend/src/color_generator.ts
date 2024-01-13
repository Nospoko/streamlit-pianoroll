// Define a type for RGB color, which is a tuple of three numbers
type RGBColor = [number, number, number];

export function interpolateColor(color1: RGBColor, color2: RGBColor, factor?: number): RGBColor {
  if (factor === undefined) {
    factor = 0.5;
  }
  const result: RGBColor = [...color1];
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
  }
  return result;
}

// Convert a hex color to its RGB components
function hexToRgb(hex: string): RGBColor {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
}

// Define a type for gradient stop
export type GradientStop = {
  pos: number;
  color: string;
};

export function generateVelocityGradient(gradientStops: GradientStop[]): string[] {
  // Generate the colormap
  const gradient_colormap: string[] = [];
  for (let i = 0; i <= 127; i++) {
    let gradientPosition = (i / 127) * 100;

    for (let j = 0; j < gradientStops.length - 1; j++) {
      if (gradientPosition >= gradientStops[j].pos && gradientPosition <= gradientStops[j + 1].pos) {
        let factor = (gradientPosition - gradientStops[j].pos) / (gradientStops[j + 1].pos - gradientStops[j].pos);
        let color1 = hexToRgb(gradientStops[j].color);
        let color2 = hexToRgb(gradientStops[j + 1].color);

        let interpolatedColor = interpolateColor(color1, color2, factor);
        gradient_colormap.push(`rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`);
        break;
      }
    }
  }

  return gradient_colormap;
}
