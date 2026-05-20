import axiosClient from "@/src/lib/axios";
import type { ApiResponse } from "@/src/types/api.types";
import type { ReactionTypeKey } from "../lib/reaction-display";

export interface CommentReactionSummary {
  reactionType: ReactionTypeKey;
  count: number;
  userReacted: boolean;
}

const BASE = "/api/v1";

export const reactionApi = {
  getForComment: (commentId: number) =>
    axiosClient.get<ApiResponse<CommentReactionSummary[]>>(
      `${BASE}/comments/${commentId}/reactions`
    ),

  toggle: (commentId: number, reactionType: ReactionTypeKey) =>
    axiosClient.post<ApiResponse<CommentReactionSummary>>(
      `${BASE}/comments/${commentId}/reactions`,
      { reactionType }
    ),
};
