import { Image as ImageIcon, Link2, Type } from "lucide-react";

export function TagIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (name === "Link2") return <Link2 className={className} />;
  if (name === "Image") return <ImageIcon className={className} />;
  return <Type className={className} />;
}
