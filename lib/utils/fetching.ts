import fs from "node:fs";
import path from "node:path";

type NoteHandler<T> = (
  fileName: string,
  relativePath: string,
  note: Buffer,
  result: T,
) => T;

export async function iterNotes<T>(handler: NoteHandler<T>) {
  const result = {} as T;
  const notesDir = path.join(process.cwd(), "content", "notes");

  function walkDir(currentDir: string) {
    const items = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentDir, item.name);
      if (item.isDirectory()) {
        walkDir(fullPath);
      } else if (item.isFile() && item.name.endsWith(".mdx")) {
        const relativePath = path.relative(notesDir, currentDir);
        const note = fs.readFileSync(fullPath);
        handler(item.name, relativePath, note, result);
      }
    }
  }

  walkDir(notesDir);
  return result;
}

export function wrapPromise<T>(promise: Promise<T>) {
  let status = "pending";
  let response: T;

  const suspender = promise.then(
    (res) => {
      status = "success";
      response = res;
    },
    (err) => {
      status = "error";
      response = err;
    },
  );
  const read = () => {
    switch (status) {
      case "pending":
        throw suspender;
      case "error":
        throw response;
      default:
        return response;
    }
  };
  return { read };
}
