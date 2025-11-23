"use client";
import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TreeNode } from "./layout";

interface Props {
  noteTree: Record<string, TreeNode>;
}

function titleCase(text: string) {
  return text
    .replace(/_/g, " ") // Replace all underscores with spaces
    .replace(/\w\S*/g, (t) => {
      // Convert to title case
      return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
    });
}

function DirectoryItem({ node }: { node: TreeNode }) {
  const pathname = usePathname();

  const subItem = useMemo(() => {
    return (
      <>
        {node.notes.map((note) => {
          const href = `/notes/${node.path}/${note.slug}`;
          const isActive = pathname == href;

          return (
            <li
              key={`file.${node.path}/${note.slug}`}
              className="relative list-none"
            >
              <Link
                href={href}
                className={`inline-block text-wrap pl-6 text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-secondary font-medium"
                    : "text-text hover:text-text/80"
                }`}
              >
                {note.title}
              </Link>
            </li>
          );
        })}
        {Object.values(node.children).map((childNode) => (
          <DirectoryItem key={`dir.${childNode.path}`} node={childNode} />
        ))}
      </>
    );
  }, [node, pathname]);

  const hasChildren =
    node.notes.length > 0 || Object.keys(node.children).length > 0;
  if (!hasChildren) return null;

  return (
    <li key={`li.${node.path}`} className="relative list-none my-1">
      <input
        key={`input.${node.path}`}
        id={`folder-${node.path}`}
        type="checkbox"
        className="peer absolute top-1 left-0 z-1 h-5 w-5 cursor-pointer opacity-0"
      />
      <label
        key={`label.${node.path}`}
        htmlFor={`folder-${node.path}`}
        className='after:-rotate-45 absolute top-0 left-0 inline-block h-5 w-5 translate-y-0.5 after:absolute after:top-[50%] after:left-[50%] after:box-border after:block after:h-1/3 after:w-1/3 after:translate-x-[-50%] after:translate-y-[-75%] after:border-text after:border-r after:border-b after:transition-transform after:content-[""] peer-checked:after:rotate-45 cursor-pointer hover:after:border-secondary'
      />
      <span className="text-wrap pl-6 font-bold text-text">
        {titleCase(node.name)}
      </span>
      <ul
        key={`ul.${node.path}`}
        className="h-0 list-none overflow-hidden pl-4 peer-checked:h-auto"
      >
        {subItem}
      </ul>
    </li>
  );
}

function Toggle() {
  return (
    <>
      <input
        key={"input.sidebar"}
        id="sidebar-toggle"
        type="checkbox"
        className="peer hidden"
      />
      <label
        key={"label.sidebar"}
        htmlFor="sidebar-toggle"
        className="-ml-2 after:-rotate-45 absolute bottom-[10%] left-full z-1 flex h-10 w-10 cursor-pointer items-center rounded-r-full bg-primary/50 shadow-trb backdrop-blur-xs after:h-1/3 after:w-1/3 after:translate-x-[90%] after:border-text after:border-r-2 after:border-b-2 after:transition-transform hover:after:border-secondary peer-checked:ml-0 peer-checked:after:rotate-[135deg] md:hidden dark:shadow-black/50"
      />
    </>
  );
}

export default function Sidebar({ noteTree }: Props) {
  return (
    <aside className="absolute top-0 left-0 z-1 h-full w-auto flex-none bg-primary/50 shadow-r backdrop-blur-sm md:relative dark:shadow-black/50">
      <Toggle />
      <nav className="h-full w-0 overflow-y-scroll bg-primary/0 transition-transform peer-checked:w-max md:min-w-max">
        <ul className="h-auto list-none">
          {Object.entries(noteTree).map(([key, node]) => (
            <DirectoryItem key={`root.${key}`} node={node} />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
