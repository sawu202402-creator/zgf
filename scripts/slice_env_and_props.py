#!/usr/bin/env python3
"""
Processes and defringes the newly generated flat 2D side-view AI environment
pieces (seamless bluestone ground slab, 3-arch carved bridge, carved timber
pavilion platform, and 4 painted world items/altars) and generates a dark-night
verification sheet!
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


def main():
    proof = []

    # 1. Seamless horizontal 2D side-view ground slab (`env_ground_slab.webp`)
    slab_src = os.path.join(ARTIFACT_DIR, "env_2d_ground_slab_1794997987380.jpg")
    slab_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(slab_src)))
    sw, sh = slab_clean.size
    # Trim 5% on left & right to cut off the jagged outer brick end-caps so horizontal tiling is seamless!
    trim_x = int(sw * 0.055)
    slab_seamless = slab_clean.crop((trim_x, 0, sw - trim_x, sh))
    # Resize to height 120px
    nh = 120
    nw = int(round(slab_seamless.size[0] * (nh / float(slab_seamless.size[1]))))
    slab_out = slab_seamless.resize((nw, nh), Image.LANCZOS)
    slab_out.save(os.path.join(OUT_DIR, "env_ground_slab.webp"), "WEBP", quality=90, method=4)
    proof.append(("env_ground_slab", slab_out))
    print(f"[OK ENV] env_ground_slab.webp {slab_out.size}")

    # 2. 3-Arch 2D side-view carved stone bridge (`env_bridge.webp`)
    br_src = os.path.join(ARTIFACT_DIR, "env_2d_bridge_1794998002864.jpg")
    br_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(br_src)))
    bw, bh = br_clean.size
    target_bw = 780
    target_bh = int(round(bh * (target_bw / float(bw))))
    br_out = br_clean.resize((target_bw, target_bh), Image.LANCZOS)
    br_out.save(os.path.join(OUT_DIR, "env_bridge.webp"), "WEBP", quality=90, method=4)
    proof.append(("env_bridge", br_out))
    print(f"[OK ENV] env_bridge.webp {br_out.size}")

    # 3. Flat 2D side-view carved timber pavilion platform (`env_pavilion.webp`)
    pv_src = os.path.join(ARTIFACT_DIR, "env_2d_pavilion_plat_1794997994036.jpg")
    pv_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(pv_src)))
    pw, ph = pv_clean.size
    target_pw = 360
    target_ph = int(round(ph * (target_pw / float(pw))))
    pv_out = pv_clean.resize((target_pw, target_ph), Image.LANCZOS)
    pv_out.save(os.path.join(OUT_DIR, "env_pavilion.webp"), "WEBP", quality=90, method=4)
    proof.append(("env_pavilion", pv_out))
    print(f"[OK ENV] env_pavilion.webp {pv_out.size}")

    # 4. 4 Painted World Items & Altars (`sheet_world_props4`)
    pr_src = os.path.join(ARTIFACT_DIR, "sheet_world_props4_1794998014643.jpg")
    pr_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(pr_src)))
    items = se.extract_poses_with_fragments(pr_clean, 4)
    item_specs = [
        ("item_sword_altar", 136),
        ("item_armor_stand", 136),
        ("item_celadon_gourd", 84),
        ("item_lotus_chicken", 76),
    ]
    for idx, (iname, max_h) in enumerate(item_specs):
        if idx >= len(items):
            break
        im = items[idx]
        iw, ih = im.size
        sc = max_h / float(ih)
        iout = im.resize((max(1, int(round(iw * sc))), max_h), Image.LANCZOS)
        iout.save(os.path.join(OUT_DIR, f"{iname}.webp"), "WEBP", quality=92, method=4)
        proof.append((iname, iout))
        print(f"[OK ITEM] {iname}.webp {iout.size}")

    # Build verification proof sheet on dark night background
    sheet = Image.new("RGB", (1280, 620), (8, 12, 22))
    draw = ImageDraw.Draw(sheet)
    # Row 1: bridge + pavilion
    sheet.paste(br_out.resize((520, int(br_out.size[1] * 520 / br_out.size[0]))), (20, 20), br_out.resize((520, int(br_out.size[1] * 520 / br_out.size[0]))))
    draw.text((24, 8), "env_bridge", fill=(246, 220, 141))
    sheet.paste(pv_out, (580, 30), pv_out)
    draw.text((584, 12), "env_pavilion", fill=(246, 220, 141))

    # Row 2: ground slab tiled twice side-by-side to verify seamlessness!
    slab_disp = slab_out.resize((420, 90), Image.LANCZOS)
    sheet.paste(slab_disp, (20, 320), slab_disp)
    sheet.paste(slab_disp, (440, 320), slab_disp)
    draw.text((24, 302), "env_ground_slab (tiled 2x seamlessly)", fill=(246, 220, 141))

    # Row 3: 4 world items
    ix = 20
    for iname, iim in proof[3:]:
        sheet.paste(iim, (ix, 580 - iim.size[1]), iim)
        draw.text((ix, 588), iname, fill=(246, 220, 141))
        ix += iim.size[0] + 48

    proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_env_props_sheet.png")
    sheet.save(proof_p)
    print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
