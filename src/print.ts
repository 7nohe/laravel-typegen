import fs from "node:fs";
import path from "node:path";

function printGeneratedTS(
  filename: string,
  result: string,
  outputPath: string,
) {
  fs.writeFileSync(path.join(outputPath, filename), result);
}

export function print(filename: string, result: string, outputPath: string) {
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  printGeneratedTS(filename, result, outputPath);
}
