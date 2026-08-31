import { Bookmark, Image as ImageIcon, MessageCircle } from "lucide-react";

export function TagIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  if (name === "Bookmark") return <Bookmark className={className} />;
  if (name === "Image") return <ImageIcon className={className} />;
  return <MessageCircle className={className} />;
}
