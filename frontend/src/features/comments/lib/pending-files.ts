export interface PendingFile {
  id: string;
  file: File;
  previewUrl: string | null;
}

const IMAGE_TYPES = /^image\/(jpeg|png|gif|webp)$/i;

export function isImageFile(file: File): boolean {
  return IMAGE_TYPES.test(file.type);
}

export function createPendingFile(file: File): PendingFile {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    previewUrl: isImageFile(file) ? URL.createObjectURL(file) : null,
  };
}

export function revokePendingFiles(files: PendingFile[]) {
  for (const f of files) {
    if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
  }
}

export const COMMENT_FILE_ACCEPT =
  ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,image/*,application/pdf";

export const MAX_COMMENT_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_COMMENT_FILES = 5;
