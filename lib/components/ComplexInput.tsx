import type { HTMLProps, KeyboardEvent } from "react";

interface Props extends HTMLProps<HTMLFormElement> {
  onExpressionChange: (expr: string) => void;
}

export default function ComplexInput({ onExpressionChange, ...props }: Props) {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onExpressionChange((e.target as HTMLInputElement).value);
    }
  };

  return (
    <form
      action=""
      className={props.className}
      {...props}
      onSubmit={(e) => e.preventDefault()}
    >
      <input
        className="size-full px-3 bg-primary text-text border-secondary border-b lg:border-r lg:border-b-0"
        type="text"
        placeholder={"Complex function in the form f(z)"}
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
      />
    </form>
  );
}
