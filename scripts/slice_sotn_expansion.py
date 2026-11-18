#!/usr/bin/env python3
"""
Slices and defringes the SotN Expansion painted sprite sheets:
- boss_xiao_0..2 (萧断水: guard, lightning windup, dragon lunge — also used for playable Xiao Duanshui Mode!)
- boss_pei_0..2 (裴无极 / 烛阴: floating stance, overhead demon charge, blood-moon cleave)
- part_wpn_spear, part_wpn_daggers, part_wpn_whip, item_relic_pedestal
Generates a dark-night proof sheet for visual QA!
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


def slice_by_x_bands(rgba: Image.Image, bands):
    w, h = rgba.size
    results = []
    for x0_f, x1_f in bands:
        x0 = int(round(w * x0_f))
        x1 = int(round(w * x1_f))
        sub = rgba.crop((x0, 0, x1, h))
        bbox = sub.getbbox()
        if bbox:
            sub = sub.crop(bbox)
        results.append(sub)
    return results


def main():
    boss_rows = []

    # 1. Xiao Duanshui 3-frame sheet (by clean X-bands so lightning sparks stay with pose 2!)
    xiao_src = os.path.join(ARTIFACT_DIR, "sheet_boss_xiao3_1794999000168.jpg")
    xiao_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(xiao_src)))
    xiao_poses = slice_by_x_bands(xiao_rgba, [(0.02, 0.345), (0.335, 0.655), (0.648, 0.995)])
    # Wait: check overlap between pose 0 spear tip (~0.342) and pose 1 cape (~0.338) using connected components!
    xiao_cc = se.extract_poses_with_fragments(xiao_rgba, 3)
    xiao_scale = 196.0 / float(xiao_cc[0].size[1])
    xiao_row = []
    for idx, nm in enumerate(["boss_xiao_0", "boss_xiao_1", "boss_xiao_2"]):
        norm = se.normalize_enemy_frame(xiao_cc[idx], xiao_scale)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        xiao_row.append((nm, norm))
        print(f"[OK BOSS] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")
    boss_rows.append(xiao_row)

    # 2. Pei Wuji / Zhuyin 3-frame sheet
    pei_src = os.path.join(ARTIFACT_DIR, "sheet_boss_pei3_1794999017184.jpg")
    pei_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(pei_src)))
    pei_cc = se.extract_poses_with_fragments(pei_rgba, 3)
    # Pose 2 (cleave) or Pose 0 (floating) reference height -> 228px on 360x270 canvas
    pei_scale = 216.0 / float(pei_cc[0].size[1])
    pei_row = []
    for idx, nm in enumerate(["boss_pei_0", "boss_pei_1", "boss_pei_2"]):
        norm = se.normalize_enemy_frame(pei_cc[idx], pei_scale)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        pei_row.append((nm, norm))
        print(f"[OK BOSS] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")
    boss_rows.append(pei_row)

    # 3. Arsenal & Relic Pedestal 4-item sheet (X-bands tuned cleanly in pure empty gaps!)
    ars_src = os.path.join(ARTIFACT_DIR, "sheet_sotn_arsenal4_1794999034527.jpg")
    ars_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(ars_src)))
    ars_items = slice_by_x_bands(
        ars_rgba,
        [
            (0.005, 0.380),  # part_wpn_spear
            (0.380, 0.555),  # part_wpn_daggers
            (0.555, 0.798),  # part_wpn_whip
            (0.800, 0.990),  # item_relic_pedestal (mirror + stone stand together!)
        ],
    )
    ars_specs = [
        ("part_wpn_spear", 220, "w"),
        ("part_wpn_daggers", 116, "h"),
        ("part_wpn_whip", 124, "h"),
        ("item_relic_pedestal", 148, "h"),
    ]
    ars_out_list = []
    for idx, (nm, target_dim, mode) in enumerate(ars_specs):
        im = ars_items[idx]
        iw, ih = im.size
        sc = (target_dim / float(iw)) if mode == "w" else (target_dim / float(ih))
        nw = max(1, int(round(iw * sc)))
        nh = max(1, int(round(ih * sc)))
        out_im = im.resize((nw, nh), Image.LANCZOS)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        out_im.save(out_p, "WEBP", quality=92, method=4)
        ars_out_list.append((nm, out_im))
        print(f"[OK ITEM] {nm}.webp {out_im.size} ({os.path.getsize(out_p)//1024} KB)")

    # Build dark-night proof sheet to inspect every sliced frame!
    proof = Image.new("RGB", (1140, 760), (8, 12, 22))
    draw = ImageDraw.Draw(proof)
    for r_i, row in enumerate(boss_rows):
        base_y = r_i * 275 + 8
        draw.line([(0, base_y + se.FOOT_Y), (1140, base_y + se.FOOT_Y)], fill=(65, 85, 115), width=1)
        for c_i, (nm, im) in enumerate(row):
            x0 = c_i * 370 + 10
            proof.paste(im, (x0, base_y), im)
            draw.line([(x0 + se.ANCHOR_X, base_y + 10), (x0 + se.ANCHOR_X, base_y + 265)], fill=(120, 60, 60), width=1)
            draw.text((x0 + 12, base_y + 6), nm, fill=(246, 220, 141))

    ix = 30
    for nm, im in ars_out_list:
        proof.paste(im, (ix, 720 - im.size[1]), im)
        draw.text((ix, 728), nm, fill=(246, 220, 141))
        ix += im.size[0] + 64

    proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_sotn_expansion.png")
    os.makedirs(os.path.dirname(proof_p), exist_ok=True)
    proof.save(proof_p)
    print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
