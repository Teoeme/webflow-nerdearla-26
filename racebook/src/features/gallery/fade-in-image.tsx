"use client";

import { useState, type ComponentProps } from "react";
import { joinClassNames } from "@/components/ui/class-names";

// A photo that shimmers with a skeleton while it loads, then fades in — instead of
// popping in as soon as the byte arrives. Shared by the grid, the lightbox and its
// filmstrip so every photo in the gallery loads the same way.
export function FadeInImage({
  wrapperClassName,
  className,
  alt,
  ...imgProps
}: ComponentProps<"img"> & { wrapperClassName?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <span className={joinClassNames("relative block overflow-hidden", wrapperClassName)}>
      {!isLoaded ? <span aria-hidden="true" className="absolute inset-0 animate-pulse bg-line" /> : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        {...imgProps}
        alt={alt ?? ""}
        onLoad={(event) => {
          setIsLoaded(true);
          imgProps.onLoad?.(event);
        }}
        className={joinClassNames("transition-opacity duration-300", isLoaded ? "opacity-100" : "opacity-0", className)}
      />
    </span>
  );
}
