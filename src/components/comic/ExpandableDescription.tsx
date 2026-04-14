"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type ExpandableDescriptionProps = {
  text: string;
  collapsedLines?: number;
};

export default function ExpandableDescription({
  text,
  collapsedLines = 4,
}: ExpandableDescriptionProps) {
  const [expanded, setExpanded] = useState(false);

  const clampClass =
    collapsedLines === 2
      ? "line-clamp-2"
      : collapsedLines === 3
        ? "line-clamp-3"
        : collapsedLines === 5
          ? "line-clamp-5"
          : "line-clamp-4";

  return (
    <div className="mt-4">
      <p
        className={[
          "max-w-4xl text-xs leading-5 text-white/75 sm:text-sm",
          !expanded ? clampClass : "",
        ].join(" ")}
      >
        {text}
      </p>

      <Button
        type="button"
        variant="link"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 h-auto p-0 text-sm font-medium text-cyan-300 hover:text-cyan-200"
      >
        {expanded ? "Show less" : "Read more"}
      </Button>
    </div>
  );
}
