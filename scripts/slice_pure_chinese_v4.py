#!/usr/bin/env python3
"""
Replaces every Western-influenced visual asset with 100% Pure Traditional Chinese Guofeng art:
1. bg_chapel_spire.webp -> Pure Chinese Tang-dynasty Imperial Star-Observatory & Cloud Pavilions
2. prop_lattice_window.webp -> Rectangular Chinese Carved Rosewood & Gold Lattice Window
3. prop_chandelier.webp -> Octagonal Dragon-Head Rosewood & Silk Palace Ceiling Lantern
4. prop_bookshelf.webp -> Chinese Rosewood Cangjingge Scripture Rack with thread-bound books & scrolls
5. mob_gargoyle.webp -> Pure Chinese Mythological Thunder Yaksha (flipped right-facing)
6. prop_guardian_statue.webp -> Clean stone plinth (removes tiny glowing Futhark-like scratches on base)
"""
import os
import sys

sys.path.insert(0, "/home/better/IdeaProjects/zgf/scripts")
from PIL import Image, ImageDraw
import process_assets as pa
import defringe_props as dp
import slice_enemy_sheets as se

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"
SCRATCH_DIR = os.path.join(ARTIFACT_DIR, "scratch")
os.makedirs(SCRATCH_DIR, exist_ok=True)


def slice_x_bands(rgba: Image.Image, bands):
    w, h = rgba.size
    out = []
    for x0f, x1f in bands:
        sub = rgba.crop((int(round(w * x0f)), 0, int(round(w * x1f)), h))
        bb = sub.getbbox()
        if bb:
            sub = sub.crop(bb)
        out.append(sub)
    return out


def save_tight_prop(rgba_crop: Image.Image, name: str, max_dim: int = 320) -> Image.Image:
    pw, ph = rgba_crop.size
    sc = min(1.0, max_dim / float(max(pw, ph)))
    nw = max(1, int(round(pw * sc)))
    nh = max(1, int(round(ph * sc)))
    resized = rgba_crop.resize((nw, nh), Image.LANCZOS)
    canvas = Image.new("RGBA", (nw + 8, nh + 8), (0, 0, 0, 0))
    canvas.paste(resized, (4, 4), resized)
    out_p = os.path.join(OUT_DIR, f"{name}.webp")
    canvas.save(out_p, "WEBP", quality=92, method=4)
    print(f"[OK PURE-CN PROP] {name}.webp {canvas.size} ({os.path.getsize(out_p)//1024} KB)")
    return canvas


def main():
    # 1. Replace bg_chapel_spire.webp with pure Chinese Star-Observatory panorama
    bg_src = os.path.join(ARTIFACT_DIR, "bg_ziwei_star_pavilion_1795053774090.jpg")
    bg_im = Image.open(bg_src).convert("RGB")
    bg_out = os.path.join(OUT_DIR, "bg_chapel_spire.webp")
    bg_im.save(bg_out, "WEBP", quality=86, method=4)
    print(f"[OK PURE-CN BG] bg_chapel_spire.webp {bg_im.size} ({os.path.getsize(bg_out)//1024} KB)")

    # 2. Slice & defringe 4 Pure Chinese replacements
    s_src = os.path.join(ARTIFACT_DIR, "sheet_pure_chinese4_1795053845284.jpg")
    s_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(s_src)))
    crops = slice_x_bands(
        s_rgba,
        [
            (0.01, 0.245),   # prop_lattice_window
            (0.245, 0.478),  # prop_chandelier (octagonal dragon palace lantern)
            (0.478, 0.742),  # prop_bookshelf (rosewood cangjingge shelf)
            (0.742, 0.996),  # mob_gargoyle (Thunder Yaksha)
        ],
    )

    win_im = save_tight_prop(crops[0], "prop_lattice_window", 280)
    lan_im = save_tight_prop(crops[1], "prop_chandelier", 280)

    # Fill dark rosewood backing behind the open lattice cutouts of prop_bookshelf so shelves look solid against any wall
    shelf_raw = crops[2]
    sw, sh = shelf_raw.size
    shelf_backed = Image.new("RGBA", (sw, sh), (0, 0, 0, 0))
    back_panel = Image.new("RGBA", (sw, sh), (28, 16, 18, 235))
    # Only fill inside the main cabinet body (x: 8%..92%, y: 9%..94%)
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rectangle([int(sw * 0.09), int(sh * 0.09), int(sw * 0.92), int(sh * 0.94)], fill=235)
    shelf_backed.paste(back_panel, (0, 0), mask)
    shelf_backed = Image.alpha_composite(shelf_backed, shelf_raw)
    shelf_im = save_tight_prop(shelf_backed, "prop_bookshelf", 300)

    # Flip Thunder Yaksha horizontally so default sprite faces RIGHT (+1), matching all game monsters!
    yak_flipped = crops[3].transpose(Image.FLIP_LEFT_RIGHT)
    y_sc = 202.0 / float(yak_flipped.size[1])
    yak_norm = se.normalize_enemy_frame(yak_flipped, y_sc)
    yak_out = os.path.join(OUT_DIR, "mob_gargoyle.webp")
    yak_norm.save(yak_out, "WEBP", quality=92, method=4)
    print(f"[OK PURE-CN MOB] mob_gargoyle.webp {yak_norm.size} ({os.path.getsize(yak_out)//1024} KB)")

    # 3. Clean glowing rune scratches on base of prop_guardian_statue.webp
    stat_path = os.path.join(OUT_DIR, "prop_guardian_statue.webp")
    if os.path.exists(stat_path):
        st = Image.open(stat_path).convert("RGBA")
        stw, sth = st.size
        # Clone dark stone panel strip slightly above (y: 0.70..0.74) over the rune band (y: 0.785..0.835, x: 0.16..0.84)
        px = st.load()
        for y in range(int(sth * 0.775), int(sth * 0.842)):
            for x in range(int(stw * 0.16), int(stw * 0.84)):
                r, g, b, a = px[x, y]
                if a > 80 and (r > 95 or g > 75):
                    # Darken warm orange rune glow back into weathered dark charcoal stone
                    lum = int(min(52, max(28, (b * 0.85))))
                    px[x, y] = (lum + 4, lum + 2, lum, a)
        st.save(stat_path, "WEBP", quality=92, method=4)
        print("[OK PURE-CN STATUE] Cleaned stone pedestal on prop_guardian_statue.webp")

    # 4. Render live verification composite (Pure Chinese Star Observatory + Pure Chinese Interior Hall)
    proof = Image.new("RGBA", (1280, 740), (8, 11, 20, 255))

    # Top strip: Ziwei Star Observatory (bg_chapel_spire) + Thunder Yaksha + Hero
    s1 = Image.open(bg_out).convert("RGBA").resize((1280, 420), Image.LANCZOS).crop((0, 35, 1280, 395))
    fl = Image.open(os.path.join(OUT_DIR, "env_palace_floor.webp")).convert("RGBA")
    wall = Image.open(os.path.join(OUT_DIR, "prop_stone_wall_tex.webp")).convert("RGBA").crop((18, 75, 188, 210))
    for x in range(0, 1280, wall.width):
        s1.paste(wall, (x, 294), wall)
    for x in range(0, 1280, fl.width):
        s1.paste(fl, (x, 276), fl)
    brazier = Image.open(os.path.join(OUT_DIR, "prop_dragon_brazier.webp")).convert("RGBA").resize((80, 122), Image.LANCZOS)
    statue = Image.open(stat_path).convert("RGBA").resize((84, 154), Image.LANCZOS)
    hero = Image.open(os.path.join(OUT_DIR, "h18_sword_1.webp")).convert("RGBA").resize((184, 138), Image.LANCZOS)
    yak_vis = yak_norm.resize((230, 172), Image.LANCZOS).transpose(Image.FLIP_LEFT_RIGHT)
    s1.paste(statue, (170, 130), statue)
    s1.paste(brazier, (310, 160), brazier)
    s1.paste(hero, (430, 150), hero)
    s1.paste(yak_vis, (760, 86), yak_vis)
    s1.paste(brazier, (1050, 160), brazier)
    proof.paste(s1, (0, 0))

    # Bottom strip: Main Hall & Cangjingge Library with Pure Chinese Window, Octagonal Palace Lantern & Rosewood Scripture Shelf!
    s2 = Image.open(os.path.join(OUT_DIR, "bg_main_hall.webp")).convert("RGBA").resize((1280, 420), Image.LANCZOS).crop((0, 35, 1280, 395))
    for x in range(0, 1280, wall.width):
        s2.paste(wall, (x, 294), wall)
    for x in range(0, 1280, fl.width):
        s2.paste(fl, (x, 276), fl)
    w_vis = win_im.resize((98, 224), Image.LANCZOS)
    l_vis = lan_im.resize((112, 184), Image.LANCZOS)
    sh_vis = shelf_im.resize((148, 232), Image.LANCZOS)
    ledge = Image.open(os.path.join(OUT_DIR, "env_indoor_ledge.webp")).convert("RGBA").resize((250, 80), Image.LANCZOS)
    s2.paste(w_vis, (180, 36), w_vis)
    s2.paste(w_vis, (560, 36), w_vis)
    s2.paste(l_vis, (365, 0), l_vis)
    s2.paste(ledge, (130, 152), ledge)
    s2.paste(sh_vis, (820, 50), sh_vis)
    s2.paste(sh_vis, (985, 50), sh_vis)
    s2.paste(brazier, (700, 160), brazier)
    s2.paste(hero, (420, 150), hero)
    proof.paste(s2, (0, 375))

    proof_p = os.path.join(SCRATCH_DIR, "verify_pure_chinese_v4.png")
    proof.save(proof_p)
    print(f"[PROOF SAVED] {proof_p}")


if __name__ == "__main__":
    main()
