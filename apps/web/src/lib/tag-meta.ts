import type { MemoTag } from "@repo/shared";
import { Image as ImageIcon, Link2, Type } from "lucide-react";

const ICON_MAP = {
  Type,
  Link2,
  Image: ImageIcon,
} as const;

export const TAG_ORDER: MemoTag[] = ["tweet", "tech", "other"];

export const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"] as const;

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
    className: "border border-border bg-muted text-foreground",
  },
  tech: {
    id: "tech",
    label: "Tech",
    hashtag: "#tech",
    icon: "Link2",
    description: "URL・技術記事・リソースの保存",
    className: "border border-border bg-muted text-foreground",
  },
  other: {
    id: "other",
    label: "Other",
    hashtag: "#other",
    icon: "Image",
    description: "画像メモ・その他",
    className: "border border-border bg-muted text-foreground",
  },
};

export function getTagIcon(iconName: string) {
  return ICON_MAP[iconName as keyof typeof ICON_MAP] ?? Type;
}
