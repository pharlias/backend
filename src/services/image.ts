import sharp from "sharp";
import { trace } from "potrace";
import { pharosSVGCode, uiGenerateSVG } from "../lib";

export function generateSVG(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const hue = hash % 360;
  const accentColor = `hsl(${hue}, 70%, 60%)`;
  const secondaryColor = `hsl(${(hue + 30) % 360}, 70%, 65%)`;

  return uiGenerateSVG(
    name,
    accentColor,
    secondaryColor,
    pharosSVGCode,
    hash
  ) as unknown as string;
}

export async function svgToJpg(svgString: string): Promise<Buffer> {
  return await sharp(Buffer.from(svgString))
    .jpeg({ quality: 90 })
    .toBuffer();
}

export function convertPngToSvg(buffer: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    sharp(buffer)
      .resize(512)
      .threshold(128)
      .toBuffer()
      .then((bwBuffer) => {
        trace(bwBuffer, { color: "black", background: "white" }, (err, svg) => {
          if (err) return reject(err);
          resolve(Buffer.from(svg));
        });
      })
      .catch(reject);
  });
}