import type { ComponentProps } from "react";
import Link from "next/link";
import { joinClassNames } from "./class-names";

export type ButtonVariant = "primary" | "outline";

const baseButtonClassName =
  "inline-flex items-center justify-center rounded-sm px-4 py-2 text-label transition-[opacity,border-color] focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-50 disabled:cursor-not-allowed";

const buttonVariantClassName: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:opacity-90 active:opacity-80",
  outline: "border border-line text-text hover:opacity-80 active:opacity-70",
};

function buttonClassName(variant: ButtonVariant, className: string | undefined): string {
  return joinClassNames(baseButtonClassName, buttonVariantClassName[variant], className);
}

export function Button({
  variant = "primary",
  className,
  ...rest
}: ComponentProps<"button"> & { variant?: ButtonVariant }) {
  return <button className={buttonClassName(variant, className)} {...rest} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...rest
}: ComponentProps<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={buttonClassName(variant, className)} {...rest} />;
}
