import matter from "gray-matter";
import type { NoteMatter } from "lib/utils/types";
import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import path from "node:path";
import fs from "node:fs";

export interface TreeNode {
  name: string;
  path: string;
  notes: NoteMatter[];
  children: Record<string, TreeNode>;
}

function getNotesTree(): Record<string, TreeNode> {
  const notesDir = path.join(process.cwd(), "content", "notes");

  function buildNode(currentPath: string, dirName: string): TreeNode {
    const node: TreeNode = {
      name: dirName,
      path: path.relative(notesDir, currentPath),
      notes: [],
      children: {},
    };

    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(currentPath, item.name);

      if (item.isDirectory()) {
        node.children[item.name] = buildNode(fullPath, item.name);
      } else if (item.isFile() && item.name.endsWith(".mdx")) {
        const fileContent = fs.readFileSync(fullPath, "utf-8");
        const { data } = matter(fileContent);

        node.notes.push({
          slug: item.name.replace(".mdx", ""),
          title: data.title,
        });
      }
    }
    return node;
  }

  const rootNode = buildNode(notesDir, "root");
  return rootNode.children;
}

export default async function NotesLayout({
  children,
}: {
  children: ReactNode;
}) {
  const noteTree = getNotesTree();

  return (
    <div className="relative flex h-full min-h-0">
      <Sidebar noteTree={noteTree} />
      {children}
    </div>
  );
}
