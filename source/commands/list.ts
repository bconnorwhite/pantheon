import { join } from "path";
import { readdir } from "fs/promises";
import { createCommand } from "commander-version";

async function list(root: string): Promise<string[]> {
  const results = await readdir(root, { withFileTypes: true });
  const files = results.filter((dirent) => !dirent.isDirectory()).map(({ name }) => name);
  const directories = results.filter((dirent) => dirent.isDirectory()).map(({ name }) => name);
  if(directories.includes(".git") && files.includes("package.json")) {
    return [
      root
    ];
  } else {
    const promises = await Promise.all(directories.map((directory) => {
      return list(join(root, directory));
    }));
    return promises.flat();
  }
}

export async function listAction() {
  const cwd = process.cwd();
  const repos = await list(cwd);
  console.info(repos);
}

export const listCommand = createCommand("list").action(listAction);
