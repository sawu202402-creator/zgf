#!/usr/bin/env python3
"""
Slices AI-generated multi-frame horizontal sprite sheets using 2D connected
components (preventing overlapping weapon pommels/tips from bleeding into
adjacent poses) and uniform per-sheet human body scaling so Li Yicheng's
18-year-old head/body proportions stay 100% consistent across all 14 frames!
"""
import glob
import os
import sys
from collections import deque

sys.path.insert(0, "/home/better/IdeaProjects/zgf/scripts")
from PIL import Image, ImageDraw
import process_assets as pa

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"
CANVAS_W = 340
CANVAS_H = 256
ANCHOR_X = 132  # Body core X on 340px canvas (leaves 208px on right for extended sword/modao!)
FOOT_Y = 244    # Exact ground contact Y on 256px canvas (leaves 64px overhead for raised greatsword!)


def find_latest(prefix: str):
    matches = sorted(glob.glob(os.path.join(ARTIFACT_DIR, f"{prefix}_*.jpg")))
    if matches:
        return matches[-1]
    return None


def extract_2d_character_poses(rgba_full: Image.Image, expected_count: int):
    w, h = rgba_full.size
    alpha = rgba_full.getchannel("A")
    apx = alpha.load()

    visited = bytearray(w * h)
    components = []  # list of (pixels_list, minx, miny, maxx, maxy)

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
                if len(pts) >= 25:  # drop tiny 1-4px dust
                    components.append([pts, minx, miny, maxx, maxy])

    # Sort largest components first to find the main `expected_count` characters
    components.sort(key=lambda c: len(c[0]), reverse=True)
    main_comps = components[:expected_count]
    extra_comps = components[expected_count:]

    # Attach any small detached ribbon/tassel fragment (>40px) to its closest main character
    for frag in extra_comps:
        if len(frag[0]) < 40:
            continue
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

    # Order poses strictly left-to-right by center X
    main_comps.sort(key=lambda m: 0.5 * (m[1] + m[3]))

    src_px = rgba_full.load()
    frames = []
    for pts, minx, miny, maxx, maxy in main_comps:
        fw = maxx - minx + 1
        fh = maxy - miny + 1
        pose_im = Image.new("RGBA", (fw, fh), (0, 0, 0, 0))
        dpx = pose_im.load()
        # Copy a 1px anti-aliased fringe around each component pixel too
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


def normalize_frame_with_scale(frame: Image.Image, uniform_scale: float, y_offset: int = 0) -> Image.Image:
    fw, fh = frame.size
    nw = max(1, int(round(fw * uniform_scale)))
    nh = max(1, int(round(fh * uniform_scale)))

    resized = frame.resize((nw, nh), Image.LANCZOS)
    ralpha = resized.getchannel("A").load()

    # Compute torso/head column-density weighted X centroid (restricting to human body band
    # near the densest vertical columns so giant horizontal greatswords never pull body X!)
    weighted_sum = 0.0
    total_w = 0.0
    for x in range(nw):
        col_h = 0
        for y in range(nh):
            if ralpha[x, y] > 60:
                col_h += 1
        # 4th-power column height strongly isolates the vertical head-to-hip human trunk!
        w_factor = float(col_h) ** 4
        weighted_sum += x * w_factor
        total_w += w_factor

    core_cx = int(round(weighted_sum / total_w)) if total_w > 0 else nw // 2

    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0, 0, 0, 0))
    paste_x = max(2, min(CANVAS_W - nw - 2, ANCHOR_X - core_cx))
    paste_y = max(2, FOOT_Y - nh + y_offset)
    canvas.paste(resized, (paste_x, paste_y), resized)
    return canvas


def main():
    # 1. Process youthful 18yo portrait
    p_src = find_latest("portrait_liyicheng_young")
    if p_src:
        im = Image.open(p_src).convert("RGB")
        w, h = im.size
        s = min(w, h)
        im = im.crop(((w - s) // 2, (h - s) // 2, (w + s) // 2, (h + s) // 2)).resize((240, 240), Image.LANCZOS)
        out_p = os.path.join(OUT_DIR, "portrait_liyicheng.webp")
        im.save(out_p, "WEBP", quality=90, method=4)
        print("[OK] Updated 18yo portrait_liyicheng.webp")

    # (prefix, count, names, ref_pose_idx_without_overhead_weapon, ref_target_h, per_pose_y_offsets)
    sheet_specs = [
        (
            "sheet_hero_idle_jump4",
            4,
            ["h18_idle_0", "h18_idle_1", "h18_jump_up", "h18_jump_fall"],
            0,
            180,
            [0, 0, -4, -4],
        ),
        (
            "sheet_hero_run4",
            4,
            ["h18_run_0", "h18_run_1", "h18_run_2", "h18_run_3"],
            0,
            176,
            [0, 0, 0, 0],
        ),
        (
            "sheet_hero_sword3",
            3,
            ["h18_sword_0", "h18_sword_1", "h18_sword_2"],
            0,
            180,
            [0, 0, 0],
        ),
        (
            "sheet_hero_modao3",
            3,
            ["h18_modao_idle", "h18_modao_windup", "h18_modao_cleave"],
            2,    # Pose 2 (cleave) has zero overhead weapon & boots touch exact ground!
            168,  # Matches sword_2 deep lunge human crown-to-boot height (168px)!
            [0, 0, 0],
        ),
    ]

    preview_rows = []
    for prefix, count, names, ref_idx, ref_h, y_offs in sheet_specs:
        src = find_latest(prefix)
        if not src:
            print(f"[MISSING] {prefix}")
            continue
        raw_im = Image.open(src)
        rgba = pa.remove_chroma_bg(raw_im)
        poses = extract_2d_character_poses(rgba, count)
        if len(poses) <= ref_idx:
            print(f"[WARN] Expected {count} poses in {prefix}, got {len(poses)}")
            continue

        uniform_scale = ref_h / float(poses[ref_idx].size[1])
        row_imgs = []
        for idx, out_name in enumerate(names):
            if idx >= len(poses):
                break
            norm = normalize_frame_with_scale(poses[idx], uniform_scale, y_offs[idx])
            out_path = os.path.join(OUT_DIR, f"{out_name}.webp")
            norm.save(out_path, "WEBP", quality=92, method=4)
            row_imgs.append((out_name, norm))
            print(
                f"[OK FRAME] {out_name}.webp raw={poses[idx].size} scale={uniform_scale:.3f} ({os.path.getsize(out_path)//1024} KB)"
            )
        preview_rows.append(row_imgs)

    if preview_rows:
        cols = max(len(r) for r in preview_rows)
        sheet = Image.new("RGB", (cols * CANVAS_W, len(preview_rows) * CANVAS_H), (14, 19, 30))
        draw = ImageDraw.Draw(sheet)
        for r_idx, row in enumerate(preview_rows):
            for c_idx, (label, frm) in enumerate(row):
                ox = c_idx * CANVAS_W
                oy = r_idx * CANVAS_H
                # Ground line + 180px head-height reference line + body core X crosshair
                draw.line([(ox, oy + FOOT_Y), (ox + CANVAS_W, oy + FOOT_Y)], fill=(90, 115, 145), width=1)
                draw.line([(ox, oy + FOOT_Y - 180), (ox + CANVAS_W, oy + FOOT_Y - 180)], fill=(45, 70, 90), width=1)
                draw.line([(ox + ANCHOR_X, oy + 12), (ox + ANCHOR_X, oy + FOOT_Y)], fill=(60, 80, 105), width=1)
                sheet.paste(frm, (ox, oy), frm)
                draw.text((ox + 8, oy + 6), label, fill=(246, 220, 141))
        proof_path = os.path.join(ARTIFACT_DIR, "scratch", "verify_hero_18yo_sheet.png")
        os.makedirs(os.path.dirname(proof_path), exist_ok=True)
        sheet.save(proof_path)
        print(f"[PROOF SAVED] {proof_path}")


if __name__ == "__main__":
    main()
