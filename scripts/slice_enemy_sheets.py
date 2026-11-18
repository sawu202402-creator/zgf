#!/usr/bin/env python3
"""
Slices and defringes all 14 multi-frame enemy & boss sprite frames:
- mob_sw_0..3 (剪纸刀客: walk_0, walk_1, windup, cleave)
- mob_gd_0..3 (玄甲重盾卫: walk_0, walk_1, windup, thrust)
- mob_wr_0..2 (提灯冥火鬼: float_0, float_1, lunge)
- boss_ik_0..2 (万卷妖宗·墨千秋: idle, windup, cleave)
All frames natively face RIGHT (+1), locked to shared foot/body anchors!
"""
import os
import sys
from collections import deque

sys.path.insert(0, "/home/better/IdeaProjects/zgf/scripts")
from PIL import Image, ImageDraw
import process_assets as pa
import defringe_props as dp

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"

CANVAS_W = 360
CANVAS_H = 270
ANCHOR_X = 165
FOOT_Y = 256


def extract_poses_with_fragments(rgba_full: Image.Image, expected_count: int):
    w, h = rgba_full.size
    alpha = rgba_full.getchannel("A")
    apx = alpha.load()

    visited = bytearray(w * h)
    components = []

    for y in range(h):
        row_off = y * w
        for x in range(w):
            idx = row_off + x
            if not visited[idx] and apx[x, y] > 28:
                visited[idx] = 1
                q = deque([(x, y)])
                pts = []
                minx = maxx = x
                miny = maxy = y
                while q:
                    cx, cy = q.popleft()
                    pts.append((cx, cy))
                    if cx < minx:
                        minx = cx
                    if cx > maxx:
                        maxx = cx
                    if cy < miny:
                        miny = cy
                    if cy > maxy:
                        maxy = cy
                    for nx in (cx - 1, cx, cx + 1):
                        for ny in (cy - 1, cy, cy + 1):
                            if 0 <= nx < w and 0 <= ny < h:
                                nidx = ny * w + nx
                                if not visited[nidx] and apx[nx, ny] > 28:
                                    visited[nidx] = 1
                                    q.append((nx, ny))
                if len(pts) >= 12:
                    components.append([pts, minx, miny, maxx, maxy])

    components.sort(key=lambda c: len(c[0]), reverse=True)
    main_comps = components[:expected_count]
    extra_comps = components[expected_count:]

    # Attach floating scroll segments / ink droplets to nearest main pose
    for frag in extra_comps:
        fcx = 0.5 * (frag[1] + frag[3])
        fcy = 0.5 * (frag[2] + frag[4])
        best_m = min(
            main_comps,
            key=lambda m: (fcx - 0.5 * (m[1] + m[3])) ** 2 + (fcy - 0.5 * (m[2] + m[4])) ** 2,
        )
        best_m[0].extend(frag[0])
        best_m[1] = min(best_m[1], frag[1])
        best_m[2] = min(best_m[2], frag[2])
        best_m[3] = max(best_m[3], frag[3])
        best_m[4] = max(best_m[4], frag[4])

    main_comps.sort(key=lambda m: 0.5 * (m[1] + m[3]))

    src_px = rgba_full.load()
    frames = []
    for pts, minx, miny, maxx, maxy in main_comps:
        fw = maxx - minx + 1
        fh = maxy - miny + 1
        pose_im = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
        dpx = pose_im.load()
        mask_set = set(pts)
        for px_x, px_y in pts:
            for nx in (px_x - 1, px_x, px_x + 1):
                for ny in (px_y - 1, px_y, px_y + 1):
                    if minx <= nx <= maxx and miny <= ny <= maxy:
                        c = src_px[nx, ny]
                        if c[3] > 0 and ((nx, ny) in mask_set or c[3] <= 28):
                            dpx[nx - minx, ny - miny] = c
        bbox = pose_im.getbbox()
        if bbox:
            pose_im = pose_im.crop(bbox)
        frames.append(pose_im)
    return frames


def normalize_enemy_frame(
    frame: Image.Image,
    uniform_scale: float,
    cw: int = CANVAS_W,
    ch: int = CANVAS_H,
    ax: int = ANCHOR_X,
    fy: int = FOOT_Y,
) -> Image.Image:
    fw, fh = frame.size
    nw = max(1, int(round(fw * uniform_scale)))
    nh = max(1, int(round(fh * uniform_scale)))
    if nw > cw - 12:
        sh = (cw - 12) / float(nw)
        nw = int(round(nw * sh))
        nh = int(round(nh * sh))

    resized = frame.resize((nw, nh), Image.LANCZOS)
    ralpha = resized.getchannel("A").load()

    weighted_sum = 0.0
    total_w = 0.0
    for x in range(nw):
        col_h = 0
        for y in range(nh):
            if ralpha[x, y] > 60:
                col_h += 1
        wf = float(col_h) ** 4
        weighted_sum += x * wf
        total_w += wf

    core_cx = int(round(weighted_sum / total_w)) if total_w > 0 else nw // 2
    canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    px = max(2, min(cw - nw - 2, ax - core_cx))
    py = max(2, fy - nh)
    canvas.paste(resized, (px, py), resized)
    return canvas


def main():
    specs = [
        (
            "sheet_mob_swordsman4_1794996746519.jpg",
            4,
            ["mob_sw_0", "mob_sw_1", "mob_sw_2", "mob_sw_3"],
            0,
            182,
        ),
        (
            "sheet_mob_guard4_1794996796628.jpg",
            4,
            ["mob_gd_0", "mob_gd_1", "mob_gd_2", "mob_gd_3"],
            0,
            196,
        ),
        (
            "sheet_mob_wraith3_1794996710143.jpg",
            3,
            ["mob_wr_0", "mob_wr_1", "mob_wr_2"],
            0,
            176,
        ),
        (
            "sheet_boss_inkking3_1794996729021.jpg",
            3,
            ["boss_ik_0", "boss_ik_1", "boss_ik_2"],
            0,
            224,
        ),
    ]

    rows = []
    for fname, count, out_names, ref_idx, ref_h in specs:
        src = os.path.join(ARTIFACT_DIR, fname)
        if not os.path.exists(src):
            print(f"[MISSING] {src}")
            continue
        rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(src)))
        poses = extract_poses_with_fragments(rgba, count)
        uscale = ref_h / float(poses[ref_idx].size[1])
        row = []
        for idx, nm in enumerate(out_names):
            if idx >= len(poses):
                break
            norm = normalize_enemy_frame(poses[idx], uscale)
            out_p = os.path.join(OUT_DIR, f"{nm}.webp")
            norm.save(out_p, "WEBP", quality=92, method=4)
            row.append((nm, norm))
            print(f"[OK ENEMY] {nm}.webp scale={uscale:.3f} ({os.path.getsize(out_p)//1024} KB)")
        rows.append(row)

    if rows:
        cols = max(len(r) for r in rows)
        sheet = Image.new("RGB", (cols * CANVAS_W, len(rows) * CANVAS_H), (10, 14, 24))
        draw = ImageDraw.Draw(sheet)
        for r_i, r in enumerate(rows):
            for c_i, (label, frm) in enumerate(r):
                ox = c_i * CANVAS_W
                oy = r_i * CANVAS_H
                draw.line([(ox, oy + FOOT_Y), (ox + CANVAS_W, oy + FOOT_Y)], fill=(80, 105, 135), width=1)
                draw.line([(ox + ANCHOR_X, oy + 12), (ox + ANCHOR_X, oy + FOOT_Y)], fill=(55, 75, 100), width=1)
                sheet.paste(frm, (ox, oy), frm)
                draw.text((ox + 8, oy + 6), label, fill=(246, 220, 141))
        proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_enemies_sheet.png")
        sheet.save(proof_p)
        print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
