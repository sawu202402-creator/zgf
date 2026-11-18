#!/usr/bin/env python3
"""
Slices and defringes full-body world NPCs (Su Qingyan 2-frame idle, Ouye Can,
Shopkeeper Bai) and frameless transparent waist-up dialogue busts (zero boxes,
zero circular frames, zero white borders!).
"""
import glob
import os
import sys

sys.path.insert(0, "/home/better/IdeaProjects/zgf/scripts")
from PIL import Image, ImageDraw, ImageOps
import process_assets as pa
import defringe_props as dp
import slice_hero_sheets as sh

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"


def find_latest(prefix: str):
    matches = sorted(glob.glob(os.path.join(ARTIFACT_DIR, f"{prefix}_*.jpg")))
    return matches[-1] if matches else None


def save_bust(im: Image.Image, out_name: str, target_h: int = 310, flip_x: bool = False):
    clean = dp.dark_ink_defringe(im)
    if flip_x:
        clean = ImageOps.mirror(clean)
    bbox = clean.getbbox()
    if bbox:
        clean = clean.crop(bbox)
    w, h = clean.size
    nw = max(1, int(round(w * (target_h / float(h)))))
    resized = clean.resize((nw, target_h), Image.LANCZOS)
    out_p = os.path.join(OUT_DIR, f"{out_name}.webp")
    resized.save(out_p, "WEBP", quality=92, method=4)
    print(f"[OK BUST] {out_name}.webp {resized.size} ({os.path.getsize(out_p)//1024} KB)")
    return resized


def main():
    proof_imgs = []

    # 1. Su Qingyan 2-frame full-body world NPC (use exact clean 2-pose sheet!)
    su_src = os.path.join(ARTIFACT_DIR, "sheet_npc_su2_1794993067876.jpg")
    if os.path.exists(su_src):
        rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(su_src)))
        poses = sh.extract_2d_character_poses(rgba, 2)
        if len(poses) >= 2:
            scale = 172.0 / float(poses[0].size[1])
            for i, nm in enumerate(["npc_su_0", "npc_su_1"]):
                norm = sh.normalize_frame_with_scale(poses[i], scale, 0)
                out_p = os.path.join(OUT_DIR, f"{nm}.webp")
                norm.save(out_p, "WEBP", quality=92, method=4)
                proof_imgs.append((nm, norm))
                print(f"[OK NPC] {nm}.webp ({os.path.getsize(out_p)//1024} KB)")

    # 2. Ouye Can (left) & Shopkeeper Bai (right, mirror to face right +1 consistently!)
    cm_src = os.path.join(ARTIFACT_DIR, "sheet_npc_craft_merch_1794993116718.jpg")
    if os.path.exists(cm_src):
        rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(cm_src)))
        poses = sh.extract_2d_character_poses(rgba, 2)
        if len(poses) >= 2:
            ouye_raw, bai_raw = poses[0], poses[1]
            # Ouye Can faces right (+1) already; Bai faces left (-1) so mirror to standardize +1!
            bai_mirrored = ImageOps.mirror(bai_raw)

            ouye_norm = sh.normalize_frame_with_scale(ouye_raw, 184.0 / float(ouye_raw.size[1]), 0)
            bai_norm = sh.normalize_frame_with_scale(bai_mirrored, 182.0 / float(bai_mirrored.size[1]), 0)

            ouye_norm.save(os.path.join(OUT_DIR, "npc_ouye.webp"), "WEBP", quality=92, method=4)
            bai_norm.save(os.path.join(OUT_DIR, "npc_bai.webp"), "WEBP", quality=92, method=4)
            proof_imgs.append(("npc_ouye", ouye_norm))
            proof_imgs.append(("npc_bai", bai_norm))
            print("[OK NPC] npc_ouye.webp & npc_bai.webp")

            # Also extract frameless waist-up busts for Ouye Can & Bai Zhanggui (upper 58%)
            ow, oh = ouye_raw.size
            save_bust(ouye_raw.crop((0, 0, ow, int(oh * 0.60))), "bust_ouye_can", 290, flip_x=True)
            bw, bh = bai_raw.size
            save_bust(bai_raw.crop((0, 0, bw, int(bh * 0.60))), "bust_bai_zhanggui", 290, flip_x=False)

    # 3. Frameless waist-up dialogue busts for 18yo Li Yicheng & 17yo Su Qingyan
    bust_src = os.path.join(ARTIFACT_DIR, "sheet_busts_dialogue_1794993137576.jpg")
    if os.path.exists(bust_src):
        rgba = pa.remove_chroma_bg(Image.open(bust_src))
        poses = sh.extract_2d_character_poses(rgba, 2)
        if len(poses) >= 2:
            b_li = save_bust(poses[0], "bust_liyicheng", 310, flip_x=False)
            b_su = save_bust(poses[1], "bust_su_qingyan", 300, flip_x=False)
            proof_imgs.append(("bust_liyicheng", b_li))
            proof_imgs.append(("bust_su_qingyan", b_su))

    # 4. Also create frameless transparent busts for Xiao Duanshui & Pei Wuji from existing sprites
    for src_name, bust_name in [("npc_xiao_boss", "bust_xiao_duanshui"), ("boss_opera_god", "bust_peiwuji")]:
        sp_path = os.path.join(OUT_DIR, f"{src_name}.webp")
        if os.path.exists(sp_path):
            sp_im = Image.open(sp_path).convert("RGBA")
            sw, sh_h = sp_im.size
            cropped = sp_im.crop((0, 0, sw, int(sh_h * 0.68)))
            save_bust(cropped, bust_name, 260, flip_x=False)

    # Save visual verification contact sheet on dark night background (2 rows so all fit!)
    if proof_imgs:
        sheet = Image.new("RGB", (1360, 560), (10, 14, 24))
        draw = ImageDraw.Draw(sheet)
        for idx, (label, im) in enumerate(proof_imgs):
            col = idx % 4
            row = idx // 4
            ox = col * 340
            oy = row * 280
            iw, ih = im.size
            sc = min(1.0, 245.0 / max(1, ih))
            dw, dh = max(1, int(iw * sc)), max(1, int(ih * sc))
            disp = im.resize((dw, dh), Image.LANCZOS)
            sheet.paste(disp, (ox + 16, oy + 250 - dh), disp)
            draw.text((ox + 20, oy + 256), label, fill=(246, 220, 141))
        proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_npcs_and_busts.png")
        sheet.save(proof_p)
        print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
