import { Bookmark, Image as ImageIcon, MessageCircle } from "lucide-react";
import type { MemoTag } from "@repo/shared";

const ICON_MAP = {
  MessageCircle,
  Bookmark,
  Image: ImageIcon,
} as const;

export const TAG_ORDER: MemoTag[] = ["tweet", "tech", "other"];

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
    icon: "MessageCircle",
    description: "思ったこと・つぶやき・テキストメモ",
    className: "bg-sky-tint text-signal-blue",
  },
  tech: {
    id: "tech",
    label: "Tech",
    hashtag: "#tech",
    icon: "Bookmark",
    description: "URL・技術記事・リソースの保存",
    className: "bg-sky-tint text-notion-blue",
  },
  other: {
    id: "other",
    label: "Other",
    hashtag: "#other",
    icon: "Image",
    description: "画像メモ・その他",
    className: "bg-paper-warmth text-stone",
  },
};

export function getTagIcon(iconName: string) {
  return ICON_MAP[iconName as keyof typeof ICON_MAP] ?? MessageCircle;
}
