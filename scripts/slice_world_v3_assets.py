#!/usr/bin/env python3
"""
Slices, chroma-keys, dark-ink defringes, and normalizes all 16 World v3 Richness assets:
1. 4 New Lush Biome Panoramas:
   - bg_opera_market.webp
   - bg_molten_forge.webp
   - bg_chapel_spire.webp
   - bg_cavern_waterfall.webp
2. 8 Warm Lighting, Architectural & Foreground Depth Props:
   - prop_dragon_brazier.webp
   - prop_silk_banner.webp
   - prop_weapon_rack.webp
   - prop_guardian_statue.webp
   - prop_coiled_pillar.webp
   - prop_incense_burner.webp
   - prop_giant_bell.webp
   - prop_stone_wall_tex.webp
3. 4 Bespoke Boss Frames for Molten Forge & Opera Theatre:
   - boss_ft_0.webp, boss_ft_1.webp (赤铜镇火巨灵)
   - boss_op_0.webp, boss_op_1.webp (惊梦百戏傩神)
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
    print(f"[OK PROP] {name}.webp {canvas.size} ({os.path.getsize(out_p)//1024} KB)")
    return canvas


def main():
    # 1. Save 4 New 16:9 Biome Panoramas
    bg_specs = [
        ("bg_opera_market", "bg_opera_market_1795016574716.jpg"),
        ("bg_molten_forge", "bg_molten_forge_1795016597047.jpg"),
        ("bg_chapel_spire", "bg_chapel_spire_1795016606291.jpg"),
        ("bg_cavern_waterfall", "bg_cavern_waterfall_1795016617177.jpg"),
    ]
    for out_name, src_file in bg_specs:
        im = Image.open(os.path.join(ARTIFACT_DIR, src_file)).convert("RGB")
        out_p = os.path.join(OUT_DIR, f"{out_name}.webp")
        im.save(out_p, "WEBP", quality=86, method=4)
        print(f"[OK BG] {out_name}.webp {im.size} ({os.path.getsize(out_p)//1024} KB)")

    # 2. Warm Props Sheet (4 columns)
    w_src = os.path.join(ARTIFACT_DIR, "sheet_warm_props4_1795016628461.jpg")
    w_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(w_src)))
    w_crops = slice_x_bands(
        w_rgba,
        [
            (0.005, 0.285),  # prop_dragon_brazier
            (0.282, 0.503),  # prop_silk_banner
            (0.503, 0.735),  # prop_weapon_rack
            (0.735, 0.995),  # prop_guardian_statue
        ],
    )
    warm_outs = [
        ("prop_dragon_brazier", save_tight_prop(w_crops[0], "prop_dragon_brazier", 240)),
        ("prop_silk_banner", save_tight_prop(w_crops[1], "prop_silk_banner", 300)),
        ("prop_weapon_rack", save_tight_prop(w_crops[2], "prop_weapon_rack", 270)),
        ("prop_guardian_statue", save_tight_prop(w_crops[3], "prop_guardian_statue", 280)),
    ]

    # 3. Depth & Architecture Props Sheet (4 columns)
    d_src = os.path.join(ARTIFACT_DIR, "sheet_depth_props4_final_1795016679168.jpg")
    d_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(d_src)))
    d_crops = slice_x_bands(
        d_rgba,
        [
            (0.005, 0.198),  # prop_coiled_pillar
            (0.198, 0.402),  # prop_incense_burner
            (0.402, 0.692),  # prop_giant_bell
            (0.692, 0.995),  # prop_stone_wall_tex
        ],
    )
    # Trim 4px outer ink border on stone_wall_tex interior if needed? Wait: keeping full ornate molding block is awesome for terrace pedestals AND slicing interior rows gives seamless dark-slate masonry!
    depth_outs = [
        ("prop_coiled_pillar", save_tight_prop(d_crops[0], "prop_coiled_pillar", 380)),
        ("prop_incense_burner", save_tight_prop(d_crops[1], "prop_incense_burner", 260)),
        ("prop_giant_bell", save_tight_prop(d_crops[2], "prop_giant_bell", 320)),
        ("prop_stone_wall_tex", save_tight_prop(d_crops[3], "prop_stone_wall_tex", 320)),
    ]

    # 4. Boss Sheet: Furnace Titan (cols 1-2) & Opera Deity (cols 3-4)
    # Use 2D connected components on alpha > 24 so col 1's low hammer (y>0.54) and col 2's high hammer (y<0.54) separate with 0 overlap!
    b_src = os.path.join(ARTIFACT_DIR, "sheet_boss_forge_opera4_1795016965183.jpg")
    b_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(b_src)))
    bw, bh = b_rgba.size
    alpha_px = b_rgba.getchannel("A").load()

    # Polygon mask split between col 1 (low hammer at right) and col 2 (high hammer at left):
    # Diagonal line from (0.318*bw, 0.50*bh) -> (0.245*bw, 0.54*bh) -> (0.275*bw, bh) cleanly separates col 1 and col 2!
    def crop_masked_pose(src_im: Image.Image, poly_pts):
        mask = Image.new("L", (bw, bh), 0)
        ImageDraw.Draw(mask).polygon([(int(px * bw), int(py * bh)) for px, py in poly_pts], fill=255)
        out = Image.new("RGBA", (bw, bh), (0, 0, 0, 0))
        out.paste(src_im, (0, 0), mask)
        bb = out.getbbox()
        return out.crop(bb) if bb else out

    p_ft0 = crop_masked_pose(
        b_rgba,
        [(0.0, 0.0), (0.242, 0.0), (0.242, 0.51), (0.322, 0.51), (0.312, 0.78), (0.272, 1.0), (0.0, 1.0)],
    )
    p_ft1 = crop_masked_pose(
        b_rgba,
        [(0.242, 0.0), (0.522, 0.0), (0.522, 1.0), (0.272, 1.0), (0.312, 0.78), (0.322, 0.51), (0.242, 0.51)],
    )
    p_op0 = crop_masked_pose(b_rgba, [(0.522, 0.0), (0.745, 0.0), (0.745, 1.0), (0.522, 1.0)])
    p_op1 = crop_masked_pose(b_rgba, [(0.745, 0.0), (1.0, 0.0), (1.0, 1.0), (0.745, 1.0)])

    boss_outs = []
    for nm, pose_im, th in [
        ("boss_ft_0", p_ft0, 224),
        ("boss_ft_1", p_ft1, 236),
        ("boss_op_0", p_op0, 224),
        ("boss_op_1", p_op1, 214),
    ]:
        sc = th / float(pose_im.size[1])
        norm = se.normalize_enemy_frame(pose_im, sc)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        boss_outs.append((nm, norm))
        print(f"[OK BOSS] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")

    # 5. Render dark-night verification proof sheet
    proof = Image.new("RGBA", (1480, 920), (9, 13, 24, 255))
    draw = ImageDraw.Draw(proof)
    all_items = warm_outs + depth_outs + boss_outs
    for idx, (nm, im) in enumerate(all_items):
        col = idx % 4
        row = idx // 4
        cx = 185 + col * 365
        cy = 150 + row * 300
        sc = min(1.0, 250.0 / max(im.size[0], im.size[1]))
        dw = int(im.size[0] * sc)
        dh = int(im.size[1] * sc)
        rs = im.resize((dw, dh), Image.LANCZOS)
        proof.paste(rs, (cx - dw // 2, cy - dh // 2), rs)
        draw.text((cx - 58, cy + 122), nm, fill=(250, 204, 21, 255))

    proof_path = os.path.join(SCRATCH_DIR, "verify_world_v3_assets.png")
    proof.save(proof_path)
    print(f"[PROOF SAVED] {proof_path}")


if __name__ == "__main__":
    main()
