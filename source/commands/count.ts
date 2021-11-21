import { join, parse } from "path";
import { createReadStream } from "fs";
import { exec } from "@bconnorwhite/exec";

async function linesInFile(file: string) {
  const readStream = createReadStream(file);
  return new Promise<number>((resolve) => {
    let lines = 0;
    const newline = "\n".charCodeAt(0);
    readStream.on("data", (chunk) => {
      for(let c=0; c<chunk.length; c++) {
        if(chunk[c] === newline) {
          lines += 1;
        }
      }
    });
    readStream.on("end", () => {
      resolve(lines);
    });
  });
}

export async function count(directory: string) {
  const result = await exec({
    command: "git",
    args: [
      "ls-tree", "HEAD", {
        "full-tree": true,
        "name-only": true,
        r: true
      }
    ],
    silent: true
  });
  const files = result.textOutput.split("\n").map((name) => join(directory, name));
  const promises = await Promise.all(files.map((file) => linesInFile(file)));
  const total = promises.reduce((retval, count, index) => {
    const path = files[index] as string;
    const parsed = parse(path);
    const extension = parsed.ext || parsed.name;
    return {
      extensions: {
        [extension]: (retval.extensions[extension] ?? 0) + count,
        ...retval.extensions
      },
      total: retval.total + count
    }
  }, {
    extensions: {} as {
      [key: string]: number;
    },
    total: 0
  });
  console.log(total);
}
