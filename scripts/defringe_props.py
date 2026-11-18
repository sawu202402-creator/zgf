#!/usr/bin/env python3
"""
Eliminates white/grey die-cut sticker halos ("贴图感白边") on all props,
weapons, monsters, and bosses by applying 3-pass dark-ink matte defringing
and outer boundary alpha feathering against dark night backgrounds.
"""
import glob
import os
import sys

sys.path.insert(0, "/home/better/IdeaProjects/zgf/scripts")
from PIL import Image, ImageDraw
import process_assets as pa

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"

TARGETS = {
    "prop_shrine": 230,
    "prop_chest": 115,
    "prop_lantern": 125,
    "prop_gourd": 96,
    "prop_pavilion_platform": 150,
    "prop_stone_arch": 310,
    "part_wpn_sword": 64,
    "part_wpn_modao": 84,
    "npc_xiao_boss": 220,
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
}


def dark_ink_defringe(im: Image.Image) -> Image.Image:
    rgba = im.copy().convert("RGBA")
    w, h = rgba.size

    # 3 passes of stripping white/grey sticker rims on outer boundary pixels
    for _pass in range(3):
        px = rgba.load()
        to_modify = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                # Check if touching transparent pixel (8-neighborhood)
                near_empty = False
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        if nx < 0 or nx >= w or ny < 0 or ny >= h or px[nx, ny][3] < 35:
                            near_empty = True
                            break
                    if near_empty:
                        break
                if not near_empty:
                    continue

                hi = max(r, g, b)
                lo = min(r, g, b)
                sat = hi - lo
                # White/light-grey sticker halo or pale green-white JPEG fringe!
                if lo > 125 and sat < 52:
                    to_modify.append((x, y, (0, 0, 0, 0)))
                elif hi > 165 and sat < 36:
                    to_modify.append((x, y, (0, 0, 0, 0)))
                else:
                    # Darken outer 1px anti-aliased edge into natural black ink (#080b12)
                    nr = int(r * 0.58)
                    ng = int(g * 0.58)
                    nb = int(b * 0.62)
                    na = int(a * 0.82)
                    to_modify.append((x, y, (nr, ng, nb, na)))

        for x, y, val in to_modify:
            px[x, y] = val

    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    return rgba


def main():
    proof_items = []
    for name, max_h in TARGETS.items():
        src = pa.find_source(name)
        if not src:
            continue
        raw = Image.open(src)
        clean = pa.remove_chroma_bg(raw)
        clean = dark_ink_defringe(clean)
        cw, ch = clean.size
        if ch > max_h:
            nw = max(1, int(round(cw * (max_h / ch))))
            clean = clean.resize((nw, max_h), Image.LANCZOS)
        out = os.path.join(OUT_DIR, f"{name}.webp")
        clean.save(out, "WEBP", quality=90, method=4)
        if name.startswith("prop_") or name.startswith("part_wpn_"):
            proof_items.append((name, clean))
        print(f"[DEFRINGED] {name}.webp -> {clean.size}")

    # Build dark-night proof sheet to verify zero white sticker rims!
    if proof_items:
        sheet = Image.new("RGB", (980, 360), (9, 13, 24))
        draw = ImageDraw.Draw(sheet)
        cx = 20
        for label, im in proof_items:
            iw, ih = im.size
            scale = min(1.0, 180.0 / max(1, iw), 250.0 / max(1, ih))
            dw, dh = max(1, int(iw * scale)), max(1, int(ih * scale))
            disp = im.resize((dw, dh), Image.LANCZOS)
            sheet.paste(disp, (cx, 310 - dh), disp)
            draw.text((cx, 322), label, fill=(246, 220, 141))
            cx += max(95, dw + 24)
            if cx > 900:
                break
        proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_defringed_props.png")
        os.makedirs(os.path.dirname(proof_p), exist_ok=True)
        sheet.save(proof_p)
        print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
