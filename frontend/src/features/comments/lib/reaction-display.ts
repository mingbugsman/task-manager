export type ReactionTypeKey = "LIKE" | "HEART" | "SMILE" | "FIRE" | "THANKS";

export const REACTION_EMOJI: Record<ReactionTypeKey, string> = {
  LIKE: "👍",
  HEART: "❤️",
  SMILE: "😊",
  FIRE: "🔥",
  THANKS: "🙏",
};

export const REACTION_OPTIONS: { type: ReactionTypeKey; label: string }[] = [
  { type: "LIKE", label: "Thích" },
  { type: "HEART", label: "Yêu thích" },
  { type: "SMILE", label: "Cười" },
  { type: "FIRE", label: "Hay" },
  { type: "THANKS", label: "Cảm ơn" },
];
