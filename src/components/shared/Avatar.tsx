import Image from "next/image";
import { has, initials } from "@/lib/resume/view";

/**
 * Profile photo, or the person's initials when there is no photo.
 * `className` styles both variants (shape, ring, border); `fallbackClassName`
 * adds the colours and type for the initials tile.
 */
export function Avatar({
  src,
  name,
  size,
  className = "",
  fallbackClassName = "bg-slate-200 text-slate-600",
  priority,
}: {
  src?: string;
  name: string;
  size: number;
  className?: string;
  fallbackClassName?: string;
  priority?: boolean;
}) {
  if (has(src)) {
    return (
      <Image
        src={src}
        alt={name}
        width={size}
        height={size}
        priority={priority}
        className={className}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={name}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      className={`inline-flex flex-shrink-0 select-none items-center justify-center font-semibold ${fallbackClassName} ${className}`}
    >
      {initials(name)}
    </span>
  );
}
