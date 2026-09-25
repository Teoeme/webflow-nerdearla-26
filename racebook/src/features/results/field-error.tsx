// The brand has no error/danger color (see docs/brand.md): accent is the
// only emphasis color available, so validation feedback reuses it.
export function FieldError({ message }: { message: string }) {
  return <span className="text-label text-accent">{message}</span>;
}
