// ============================================================================
// Avatar upload: turn whatever photo someone picks into a small square JPEG
// data URL.
//
// The draft lives in localStorage (about 5 MB per site), and a phone photo is
// often 3-8 MB, so photos are center-cropped and resized in the browser
// before they go anywhere. A 256px JPEG is usually 15-40 KB.
// ============================================================================

export const AVATAR_SIZE = 256;
export const AVATAR_MAX_INPUT_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
export const AVATAR_ACCEPT = ACCEPTED.join(",");

export class AvatarError extends Error {}

/** The largest centered square inside a width × height image. */
export function coverCrop(width: number, height: number) {
  const side = Math.min(width, height);
  return { sx: (width - side) / 2, sy: (height - side) / 2, side };
}

/** Reasons to refuse a file before decoding it. Returns null when it's fine. */
export function checkAvatarFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED.includes(file.type)) return "Please choose a JPEG, PNG, WebP, GIF or AVIF image.";
  if (file.size > AVATAR_MAX_INPUT_BYTES) return "That image is over 15 MB. Please pick a smaller one.";
  return null;
}

/** Decode, center-crop and resize a photo to a square JPEG data URL. Browser only. */
export async function avatarFromFile(file: File, size = AVATAR_SIZE): Promise<string> {
  const problem = checkAvatarFile(file);
  if (problem) throw new AvatarError(problem);

  let bitmap: ImageBitmap;
  try {
    // Respects EXIF orientation, so phone photos aren't sideways.
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new AvatarError("We couldn't read that image. Try a different file.");
  }

  try {
    const { sx, sy, side } = coverCrop(bitmap.width, bitmap.height);
    const out = Math.min(size, side);
    const canvas = document.createElement("canvas");
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new AvatarError("Your browser couldn't process the image.");
    // JPEG has no transparency: give transparent PNGs a white background
    // instead of black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, out, out);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, out, out);
    return canvas.toDataURL("image/jpeg", 0.85);
  } finally {
    bitmap.close();
  }
}
