import React from "react";

/** Renders text where **double asterisks** mark emphasised phrases. */
export function RichText({
  text,
  strongClassName = "font-semibold",
}: {
  text: string;
  strongClassName?: string;
}) {
  return (
    <>
      {text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className={strongClassName}>
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export const plainText = (text: string) => text.replace(/\*\*/g, "");
