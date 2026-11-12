import { Fragment } from "react";

/**
 * Renders dictionary text whose bold words are marked `**…**`, so a translation
 * can put the emphasis wherever its own word order lands it.
 */
export function Emphasized({ text, className }: { text: string; className: string }) {
  return (
    <>
      {text.split("**").map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className={className}>
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
