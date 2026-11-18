#!/usr/bin/env python3
"""
Studio-grade AI Game Asset Processor:
- Reads generated <name>_*.jpg files directly from the conversation artifact directory
- Converts 16:9 backgrounds & portraits to crisp optimized WebP
- Performs border flood-fill + green chroma-key + green-spill suppression on 2D sprites
- Auto-crops transparent bounding boxes so character feet align cleanly to bottom y=height
"""
import glob
import os
from collections import deque
from PIL import Image

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"
os.makedirs(OUT_DIR, exist_ok=True)

BACKGROUNDS = [
    "bg_title",
    "bg_gatehouse",
    "bg_main_hall",
    "bg_library_opera",
    "bg_forge_prison",
]

PORTRAITS = [
    "portrait_liyicheng",
    "portrait_su_qingyan",
    "portrait_xiao_duanshui",
    "portrait_peiwuji",
]

TILES = [
    "tile_stone_wall",
]

SPRITES = {
    "hero_idle": 200,
    "hero_run": 200,
    "hero_jump": 200,
    "hero_attack": 205,
    "npc_xiao_boss": 210,
    "mob_paper_swordsman": 185,
    "mob_lantern_ghost": 180,
    "mob_bronze_guard": 205,
    "mob_scroll_demon": 175,
    "mob_plague_toad": 160,
    "mob_opera_puppet": 195,
    "mob_bell_gargoyle": 200,
    "boss_scroll_king": 270,
    "boss_furnace_titan": 295,
    "boss_opera_god": 280,
    "boss_zhuyin": 315,
    "prop_shrine": 230,
    "prop_chest": 115,
    "prop_lantern": 125,
    "prop_gourd": 96,
}


def find_source(prefix: str):
    matches = sorted(glob.glob(os.path.join(ARTIFACT_DIR, f"{prefix}_*.jpg")))
    if matches:
        return matches[-1]
    matches_png = sorted(glob.glob(os.path.join(ARTIFACT_DIR, f"{prefix}_*.png")))
    if matches_png:
        return matches_png[-1]
    return None


def is_green_chroma(r: int, g: int, b: int) -> bool:
    return g > 90 and g - max(r, b) > 30


def color_dist_sq(c1, c2) -> int:
    return (c1[0] - c2[0]) ** 2 + (c1[1] - c2[1]) ** 2 + (c1[2] - c2[2]) ** 2


def remove_chroma_bg(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()

    corners = [px[0, 0][:3], px[w - 1, 0][:3], px[0, h - 1][:3], px[w - 1, h - 1][:3]]

    visited = bytearray(w * h)
    q = deque()

    def matches_bg(r: int, g: int, b: int, a: int) -> bool:
        if a < 20:
            return True
        if is_green_chroma(r, g, b):
            return True
        for cc in corners:
            if is_green_chroma(*cc) and color_dist_sq((r, g, b), cc) < 3200:
                return True
        return False

    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            if not visited[idx] and matches_bg(*px[x, y]):
                visited[idx] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            if not visited[idx] and matches_bg(*px[x, y]):
                visited[idx] = 1
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx] and matches_bg(*px[nx, ny]):
                    visited[nidx] = 1
                    q.append((nx, ny))

    # Remove enclosed green holes (e.g. between legs, under sword hilt, between scrolls)
    # and clean any JPEG green halo spill on anti-aliased dark ink outlines!
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            excess_g = g - max(r, b)
            if g > 105 and excess_g > 42:
                px[x, y] = (0, 0, 0, 0)
            elif excess_g > 12:
                new_g = max(r, b)
                fade = max(35, int(a * max(0.2, 1.0 - (excess_g - 12) / 38.0)))
                px[x, y] = (r, new_g, b, fade)

    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)

    return rgba


def process_all():
    processed = 0
    missing = []

    for name in BACKGROUNDS:
        src = find_source(name)
        if not src:
            missing.append(name)
            continue
        im = Image.open(src).convert("RGB")
        im.thumbnail((1280, 720), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        im.save(out, "WEBP", quality=84, method=4)
        processed += 1
        print(f"[OK BG] {name}.webp ({os.path.getsize(out)//1024} KB)")

    for name in PORTRAITS:
        src = find_source(name)
        if not src:
            missing.append(name)
            continue
        im = Image.open(src).convert("RGB")
        w, h = im.size
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2))
        im = im.resize((240, 240), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        im.save(out, "WEBP", quality=88, method=4)
        processed += 1
        print(f"[OK PORTRAIT] {name}.webp ({os.path.getsize(out)//1024} KB)")

    for name in TILES:
        src = find_source(name)
        if not src:
            missing.append(name)
            continue
        im = Image.open(src).convert("RGB").resize((128, 128), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        im.save(out, "WEBP", quality=88, method=4)
        processed += 1
        print(f"[OK TILE] {name}.webp ({os.path.getsize(out)//1024} KB)")

    for name, max_h in SPRITES.items():
        src = find_source(name)
        if not src:
            missing.append(name)
            continue
        im = Image.open(src)
        clean = remove_chroma_bg(im)
        cw, ch = clean.size
        if ch > max_h:
            nw = max(1, int(round(cw * (max_h / ch))))
            clean = clean.resize((nw, max_h), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        clean.save(out, "WEBP", quality=90, method=4)
        processed += 1
        print(f"[OK SPRITE] {name}.webp {clean.size} ({os.path.getsize(out)//1024} KB)")

    print(f"Total processed: {processed}, Missing: {missing}")


if __name__ == "__main__":
    process_all()
