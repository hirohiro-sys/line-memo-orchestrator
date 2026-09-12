import type { MemoTag } from "@repo/shared";
import { Image as ImageIcon, Link2, Type } from "lucide-react";

const ICON_MAP = {
  Type,
  Link2,
  Image: ImageIcon,
} as const;

export const TAG_ORDER: MemoTag[] = ["tweet", "tech", "other"];

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

export const PILL_BASE =
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-medium transition-colors duration-200";

export const PILL_IDLE =
  "border border-border bg-card text-stone hover:text-foreground";

export const TAG_META: Record<
  MemoTag,
  {
    id: MemoTag;
    label: string;
    hashtag: string;
    icon: keyof typeof ICON_MAP;
    description: string;
    className: string;
  }
> = {
  tweet: {
    id: "tweet",
    label: "つぶやき",
    hashtag: "#tweet",
    icon: "Type",
    description: "思ったこと・つぶやき・テキストメモ",
    className: "bg-marigold text-foreground",
  },
  tech: {
    id: "tech",
    label: "Tech",
    hashtag: "#tech",
    icon: "Link2",
    description: "URL・技術記事・リソースの保存",
    className: "bg-sky-tint text-foreground",
  },
  other: {
    id: "other",
    label: "Other",
    hashtag: "#other",
    icon: "Image",
    description: "画像メモ・その他",
    className: "bg-saffron text-foreground",
  },
};

export function getTagIcon(iconName: string) {
  return ICON_MAP[iconName as keyof typeof ICON_MAP] ?? Type;
}
