"""
로고(logo.png) 한 장으로 PWA에 필요한 이미지를 모두 만든다.

  python scripts/make-app-icons.py [로고 경로]

- app/favicon.ico            16·32·48px, 배경 투명
- app/icon.png               512px, 배경 투명 (고해상도 파비콘)
- app/apple-icon.png         180px, iOS 홈 화면 아이콘 (iOS는 투명을 검게 칠하므로 배경을 깐다)
- public/icons/icon-*.png    매니페스트 아이콘 (purpose: any)
- public/icons/maskable-*.png  매니페스트 아이콘 (purpose: maskable, 안전 영역 안에 로고)
- public/splash/*.png        iOS 스플래시 (lib/pwa/splash-screens.json 기기 목록 × 세로·가로)

배경색은 styles/tokens.css의 --color-neutral-200(페이지 배경, 매니페스트 background_color)을 읽어 쓴다.
"""

import json
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
LOGO = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "logo.png"

# 로고 원본 배경과 이 차이(RGB 차이 합) 안쪽이면 배경으로 보고 지운다.
BACKGROUND_THRESHOLD = 60
# 홈 화면 아이콘에서 로고가 차지하는 비율
ICON_FILL = 0.76
# 마스커블 아이콘 안전 영역: 지름 80% 원. 여유를 조금 둔다.
MASKABLE_SAFE_RADIUS = 0.38
# 스플래시에서 로고 너비 = 화면 짧은 변 × 이 비율
SPLASH_FILL = 0.36


def read_token(name: str) -> tuple[int, int, int]:
    css = (ROOT / "styles" / "tokens.css").read_text(encoding="utf-8")
    match = re.search(rf"--{name}:\s*#([0-9a-fA-F]{{6}})\s*;", css)
    if not match:
        raise SystemExit(f"tokens.css에서 --{name} 값을 찾지 못했습니다.")
    value = match.group(1)
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def cut_out(path: Path) -> Image.Image:
    """테두리에서 이어지는 배경만 투명하게 지우고(돋보기 안쪽은 남긴다) 로고 영역으로 자른다."""
    image = Image.open(path).convert("RGBA")
    background = image.getpixel((0, 0))
    padded = ImageOps.expand(image, 1, fill=background)
    ImageDraw.floodfill(padded, (0, 0), (0, 0, 0, 0), thresh=BACKGROUND_THRESHOLD)
    image = padded.crop((1, 1, padded.width - 1, padded.height - 1))
    return image.crop(image.getchannel("A").getbbox())


def fit(logo: Image.Image, longest: int) -> Image.Image:
    scale = longest / max(logo.size)
    size = (max(1, round(logo.width * scale)), max(1, round(logo.height * scale)))
    return logo.resize(size, Image.Resampling.LANCZOS)


def compose(logo: Image.Image, size: tuple[int, int], logo_longest: int, background=None) -> Image.Image:
    canvas = Image.new("RGBA", size, (*background, 255) if background else (0, 0, 0, 0))
    resized = fit(logo, logo_longest)
    canvas.alpha_composite(resized, ((size[0] - resized.width) // 2, (size[1] - resized.height) // 2))
    return canvas


def save(image: Image.Image, path: Path, opaque=False):
    path.parent.mkdir(parents=True, exist_ok=True)
    (image.convert("RGB") if opaque else image).save(path, optimize=True)
    print(f"  {path.relative_to(ROOT).as_posix()}  {image.width}x{image.height}")


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    background = read_token("color-neutral-200")
    logo = cut_out(LOGO)
    print(f"로고 영역 {logo.width}x{logo.height}, 배경 {background}")

    print("파비콘")
    favicons = [compose(logo, (s, s), s) for s in (48, 32, 16)]
    path = ROOT / "app" / "favicon.ico"
    favicons[0].save(path, sizes=[(48, 48), (32, 32), (16, 16)], append_images=favicons[1:])
    print(f"  {path.relative_to(ROOT).as_posix()}  48·32·16")
    save(compose(logo, (512, 512), 512), ROOT / "app" / "icon.png")

    print("홈 화면 아이콘")
    save(compose(logo, (180, 180), round(180 * ICON_FILL), background), ROOT / "app" / "apple-icon.png", opaque=True)
    # 로고 영역의 반대각선이 안전 영역 반지름 안에 들어오도록 줄인다.
    half_diagonal = (logo.width**2 + logo.height**2) ** 0.5 / 2
    maskable_fill = MASKABLE_SAFE_RADIUS * max(logo.size) / half_diagonal
    for s in (192, 512):
        save(compose(logo, (s, s), round(s * ICON_FILL), background), ROOT / "public" / "icons" / f"icon-{s}.png", opaque=True)
        save(compose(logo, (s, s), round(s * maskable_fill), background), ROOT / "public" / "icons" / f"maskable-{s}.png", opaque=True)

    print("iOS 스플래시")
    screens = json.loads((ROOT / "lib" / "pwa" / "splash-screens.json").read_text(encoding="utf-8"))
    for screen in screens:
        width, height = screen["width"] * screen["ratio"], screen["height"] * screen["ratio"]
        for w, h in ((width, height), (height, width)):
            image = compose(logo, (w, h), round(min(w, h) * SPLASH_FILL), background).convert("RGB")
            # 단색 배경 + 픽셀 아트라 색을 줄여도 티가 나지 않고 용량이 크게 준다.
            image = image.quantize(colors=64, dither=Image.Dither.NONE)
            save(image, ROOT / "public" / "splash" / f"{w}x{h}.png")


if __name__ == "__main__":
    main()
