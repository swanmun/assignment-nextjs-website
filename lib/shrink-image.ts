/**
 * 사진을 BFF로 보내기 전에 브라우저에서 줄인다. 브라우저 전용.
 * Vercel 함수는 요청 본문을 4.5MB까지만 받으므로 긴 변과 용량을 줄여 보낸다.
 */

type ShrinkOptions = {
  /** 긴 변 최대 픽셀 */
  maxSide: number;
  /** 결과 파일 최대 바이트 */
  maxBytes: number;
};

/** 이 순서로 품질을 낮춰 보고, 그래도 크면 긴 변을 SIDE_STEP만큼 줄여 다시 시도한다. */
const QUALITIES = [0.85, 0.75, 0.65];
const SIDE_STEP = 0.75;
const MIN_SIDE = 320;

const FAILED = "사진을 줄이지 못했어요. 다른 사진을 골라 주세요.";

const loadImage = async (file: File) => {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  } catch {
    throw new Error(FAILED);
  } finally {
    URL.revokeObjectURL(url);
  }
};

const toJpeg = (canvas: HTMLCanvasElement, quality: number) =>
  new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error(FAILED))), "image/jpeg", quality),
  );

const jpegName = (name: string) => `${name.replace(/\.[^.]+$/, "")}.jpg`;

/**
 * 긴 변 maxSide 이하, 용량 maxBytes 이하인 JPG로 바꾼다. 이미 maxBytes 이하면 그대로 둔다.
 * 사진 회전(EXIF)은 브라우저가 반영해 그린다.
 */
export async function shrinkImage(file: File, { maxSide, maxBytes }: ShrinkOptions): Promise<File> {
  if (file.size <= maxBytes) return file;

  const image = await loadImage(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!longest || !context) throw new Error(FAILED);

  let side = Math.min(maxSide, longest);
  for (;;) {
    canvas.width = Math.round((image.naturalWidth * side) / longest);
    canvas.height = Math.round((image.naturalHeight * side) / longest);
    // 크기를 바꾸면 그리기 설정이 초기화되므로 매번 다시 정한다.
    context.imageSmoothingQuality = "high";
    // JPG는 투명을 지원하지 않아 PNG의 투명한 곳을 흰 바탕으로 채운다.
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    for (const quality of QUALITIES) {
      const blob = await toJpeg(canvas, quality);
      if (blob.size <= maxBytes) return new File([blob], jpegName(file.name), { type: "image/jpeg", lastModified: file.lastModified });
    }
    if (side <= MIN_SIDE) throw new Error(FAILED);
    side = Math.max(MIN_SIDE, Math.round(side * SIDE_STEP));
  }
}
