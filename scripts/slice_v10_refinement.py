#!/usr/bin/env python3
"""
StudioBase SOP Asset Pipeline v10:
- Slices & mattes sheet_gates_portals_v10 (2x2) and sheet_drops_subweapons_v10 (3x2)
- Handles enclosed interior holes on portcullis iron bars (prop_iron_gate) & chakram (item_sub_bagua)
- Preserves soft glowing violet mist on prop_mist_barrier and fire/elixir auras via chroma-distance alpha ramp
- Implements pre-multiplied RGBA resize (zero alpha in [1..9] color fringe per STUDIO_AI_ASSET_PIPELINE_GUIDE)
- Exports WebP assets to public/assets/ + 512x512 app icon + dark-night visual proof sheet
"""
import math
import os
from collections import deque
from PIL import Image, ImageChops

ARTIFACT_DIR = "/home/better/.gemini/antigravity/brain/2183b2f8-5d18-4215-a344-66c3645f1730"
OUT_DIR = "/home/better/IdeaProjects/zgf/public/assets"
SCRATCH_DIR = os.path.join(ARTIFACT_DIR, "scratch")
os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(SCRATCH_DIR, exist_ok=True)


def sample_bg_color(rgb_im: Image.Image):
    w, h = rgb_im.size
    px = rgb_im.load()
    pts = [
        px[4, 4],
        px[w - 5, 4],
        px[4, h - 5],
        px[w - 5, h - 5],
        px[w // 2, 4],
        px[w // 2, h - 5],
    ]
    r = sum(p[0] for p in pts) // len(pts)
    g = sum(p[1] for p in pts) // len(pts)
    b = sum(p[2] for p in pts) // len(pts)
    return (r, g, b)


def matte_studio_gray_crop(
    crop_rgb: Image.Image,
    bg_rgb,
    hollow_interior: bool = False,
    soft_aura: bool = False,
) -> Image.Image:
    rgba = crop_rgb.convert("RGBA")
    w, h = rgba.size
    px = rgba.load()
    br, bg, bb = bg_rgb

    def dist_to_bg(r: int, g: int, b: int) -> float:
        return math.sqrt((r - br) ** 2 + (g - bg) ** 2 + (b - bb) ** 2)

    def is_bg_pixel(r: int, g: int, b: int, tol: float) -> bool:
        sat = max(r, g, b) - min(r, g, b)
        return dist_to_bg(r, g, b) <= tol and sat <= 20

    tol = 28.0 if not soft_aura else 22.0
    visited = bytearray(w * h)
    q = deque()

    for x in range(w):
        for y in (0, h - 1):
            idx = y * w + x
            r, g, b, _ = px[x, y]
            if not visited[idx] and is_bg_pixel(r, g, b, tol + 8):
                visited[idx] = 1
                q.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            idx = y * w + x
            r, g, b, _ = px[x, y]
            if not visited[idx] and is_bg_pixel(r, g, b, tol + 8):
                visited[idx] = 1
                q.append((x, y))

    while q:
        cx, cy = q.popleft()
        px[cx, cy] = (0, 0, 0, 0)
        for nx, ny in ((cx - 1, cy), (cx + 1, cy), (cx, cy - 1), (cx, cy + 1)):
            if 0 <= nx < w and 0 <= ny < h:
                nidx = ny * w + nx
                if not visited[nidx]:
                    r, g, b, _ = px[nx, ny]
                    if is_bg_pixel(r, g, b, tol):
                        visited[nidx] = 1
                        q.append((nx, ny))

    # Hollow enclosed neutral-gray holes (between portcullis bars or inside chakram inner ring)
    if hollow_interior:
        cx_mid, cy_mid = w * 0.5, h * 0.5
        max_r = min(w, h) * 0.33
        for y in range(2, h - 2):
            for x in range(2, w - 2):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                # If square-ish chakram, restrict hollowing from eating outer steel blades
                if w < 490 and math.hypot(x - cx_mid, y - cy_mid) > max_r:
                    continue
                sat = max(r, g, b) - min(r, g, b)
                if dist_to_bg(r, g, b) <= 19.0 and sat <= 12:
                    px[x, y] = (0, 0, 0, 0)

    # Soft translucent ramp for mist/aura outer wisps so zero gray halo remains on dark night!
    if soft_aura:
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                d = dist_to_bg(r, g, b)
                if d < 58.0:
                    # Unmix studio gray background contribution!
                    alpha_f = max(0.0, min(1.0, (d - 16.0) / 42.0))
                    if alpha_f < 0.08:
                        px[x, y] = (0, 0, 0, 0)
                    else:
                        ur = int(max(0, min(255, (r - br * (1.0 - alpha_f)) / alpha_f)))
                        ug = int(max(0, min(255, (g - bg * (1.0 - alpha_f)) / alpha_f)))
                        ub = int(max(0, min(255, (b - bb * (1.0 - alpha_f)) / alpha_f)))
                        px[x, y] = (ur, ug, ub, int(round(alpha_f * 245)))

    # 2-pass dark-ink edge defringe on boundary pixels touching alpha==0
    for _ in range(2):
        snap = rgba.copy()
        spx = snap.load()
        for y in range(h):
            for x in range(w):
                r, g, b, a = spx[x, y]
                if a == 0:
                    continue
                touch_zero = False
                for nx in (x - 1, x, x + 1):
                    for ny in (y - 1, y, y + 1):
                        if nx < 0 or nx >= w or ny < 0 or ny >= h or spx[nx, ny][3] == 0:
                            touch_zero = True
                            break
                    if touch_zero:
                        break
                if not touch_zero:
                    continue
                sat = max(r, g, b) - min(r, g, b)
                if dist_to_bg(r, g, b) < 34.0 and sat < 24:
                    px[x, y] = (0, 0, 0, 0)
                elif not soft_aura:
                    px[x, y] = (int(r * 0.68), int(g * 0.68), int(b * 0.72), max(16, int(a * 0.85)))

    bbox = rgba.getbbox()
    if bbox:
        rgba = rgba.crop(bbox)
    return rgba


def clean_resize_rgba(im: Image.Image, target_max_dim: int) -> Image.Image:
    """Pre-multiplied RGBA resize + alpha<10 zeroing (zero 1..9 fringe pixels)."""
    w, h = im.size
    sc = min(1.0, target_max_dim / float(max(w, h)))
    nw = max(1, int(round(w * sc)))
    nh = max(1, int(round(h * sc)))
    if nw == w and nh == h:
        out = im.copy()
        opx = out.load()
        for y in range(nh):
            for x in range(nw):
                r0, g0, b0, av = opx[x, y]
                if av < 10:
                    opx[x, y] = (0, 0, 0, 0)
    else:
        r, g, b, a = im.split()
        rp = ImageChops.multiply(r, a).resize((nw, nh), Image.BILINEAR)
        gp = ImageChops.multiply(g, a).resize((nw, nh), Image.BILINEAR)
        bp = ImageChops.multiply(b, a).resize((nw, nh), Image.BILINEAR)
        ap = a.resize((nw, nh), Image.BILINEAR)
        out = Image.new("RGBA", (nw, nh))
        opx = out.load()
        rpx, gpx, bpx, apx = rp.load(), gp.load(), bp.load(), ap.load()
        for y in range(nh):
            for x in range(nw):
                av = apx[x, y]
                if av < 10:
                    opx[x, y] = (0, 0, 0, 0)
                else:
                    ur = min(255, int(round(rpx[x, y] * 255.0 / av)))
                    ug = min(255, int(round(gpx[x, y] * 255.0 / av)))
                    ub = min(255, int(round(bpx[x, y] * 255.0 / av)))
                    opx[x, y] = (ur, ug, ub, av)
    # Pad 4px transparent margin (direct RGBA copy, NEVER mask-paste onto zero alpha!)
    padded = Image.new("RGBA", (out.width + 8, out.height + 8), (0, 0, 0, 0))
    padded.paste(out, (4, 4))
    return padded


def audit_zero_fringe(im: Image.Image, name: str):
    px = im.load()
    noisy = 0
    for y in range(im.height):
        for x in range(im.width):
            a = px[x, y][3]
            if 1 <= a <= 9:
                noisy += 1
    assert noisy == 0, f"[FAIL] {name} has {noisy} pixels with alpha in [1..9]!"


def main():
    proof_sprites = []

    # 1. Process 2x2 Architectural Gates & Portals Sheet
    s1_path = os.path.join(ARTIFACT_DIR, "sheet_gates_portals_v10_1795098080904.jpg")
    s1 = Image.open(s1_path).convert("RGB")
    bg1 = sample_bg_color(s1)
    w1, h1 = s1.size
    specs_1 = [
        ("prop_iron_gate", (0, 0, w1 // 2, h1 // 2), True, False, 300),
        ("prop_mist_barrier", (w1 // 2, 0, w1, h1 // 2), False, True, 300),
        ("prop_bagua_altar", (0, h1 // 2, w1 // 2, h1), False, False, 280),
        ("prop_secret_arch", (w1 // 2, h1 // 2, w1, h1), False, False, 280),
    ]
    for name, box, hollow, aura, max_d in specs_1:
        m = matte_studio_gray_crop(s1.crop(box), bg1, hollow_interior=hollow, soft_aura=aura)
        c = clean_resize_rgba(m, max_d)
        audit_zero_fringe(c, name)
        out_p = os.path.join(OUT_DIR, f"{name}.webp")
        c.save(out_p, "WEBP", quality=92, method=4)
        proof_sprites.append((name, c))
        print(f"[OK GATE/PORTAL] {name}.webp -> {c.size} ({os.path.getsize(out_p)//1024} KB)")

    # 2. Process 3x2 Drops & Subweapons Sheet
    s2_path = os.path.join(ARTIFACT_DIR, "sheet_drops_subweapons_v10_1795098092154.jpg")
    s2 = Image.open(s2_path).convert("RGB")
    bg2 = sample_bg_color(s2)
    w2, h2 = s2.size
    cw2, ch2 = w2 // 3, h2 // 2
    specs_2 = [
        ("item_silver_sycee", (0, 0, cw2, ch2), False, False, 96),
        ("item_talisman_scroll", (cw2, 0, cw2 * 2, ch2), False, True, 96),
        ("item_yao_core", (cw2 * 2, 0, w2, ch2), False, True, 112),
        ("item_sub_seal", (0, ch2, cw2, h2), False, True, 116),
        ("item_sub_bagua", (cw2, ch2, cw2 * 2, h2), True, False, 116),
        ("item_sub_fire_gourd", (cw2 * 2, ch2, w2, h2), False, True, 116),
    ]
    for name, box, hollow, aura, max_d in specs_2:
        m = matte_studio_gray_crop(s2.crop(box), bg2, hollow_interior=hollow, soft_aura=aura)
        c = clean_resize_rgba(m, max_d)
        audit_zero_fringe(c, name)
        out_p = os.path.join(OUT_DIR, f"{name}.webp")
        c.save(out_p, "WEBP", quality=92, method=4)
        proof_sprites.append((name, c))
        print(f"[OK ITEM/SUB] {name}.webp -> {c.size} ({os.path.getsize(out_p)//1024} KB)")

    # 3. Export 2 new 16:9 Pure Chinese Biome Backgrounds
    bg_specs = [
        ("bg_catacomb_tomb", "bg_catacomb_tomb_raw_1795098132376.jpg"),
        ("bg_bamboo_cliff", "bg_bamboo_cliff_raw_1795098091982.jpg"),
    ]
    for out_name, src_file in bg_specs:
        bim = Image.open(os.path.join(ARTIFACT_DIR, src_file)).convert("RGB")
        if bim.width > 1600:
            nh = int(round(bim.height * (1600.0 / bim.width)))
            bim = bim.resize((1600, nh), Image.LANCZOS)
        bp = os.path.join(OUT_DIR, f"{out_name}.webp")
        bim.save(bp, "WEBP", quality=86, method=4)
        print(f"[OK BIOME BG] {out_name}.webp -> {bim.size} ({os.path.getsize(bp)//1024} KB)")

    # 4. Export 512x512 Commercial App Icon & 192x192 Portal Icon
    icon_src = Image.open(os.path.join(ARTIFACT_DIR, "app_icon_512_raw_1795098211428.jpg")).convert("RGB")
    icon_512 = icon_src.resize((512, 512), Image.LANCZOS)
    icon_out = os.path.join(OUT_DIR, "app_icon_512.png")
    icon_512.save(icon_out, "PNG")
    print(f"[OK APP ICON] app_icon_512.png -> {icon_512.size} ({os.path.getsize(icon_out)//1024} KB)")

    # 5. Build Dark-Night Visual Proof Sheet
    proof = Image.new("RGBA", (1160, 460), (8, 11, 20, 255))
    x_cur = 20
    y_cur = 24
    row_h = 0
    for name, sp in proof_sprites:
        sc = min(1.0, 210.0 / max(1, sp.width), 195.0 / max(1, sp.height))
        dw, dh = max(1, int(sp.width * sc)), max(1, int(sp.height * sc))
        disp = sp.resize((dw, dh), Image.BILINEAR)
        if x_cur + dw > 1140:
            x_cur = 20
            y_cur += row_h + 24
            row_h = 0
        proof.alpha_composite(disp, (x_cur, y_cur))
        x_cur += dw + 28
        row_h = max(row_h, dh)
    proof_path = os.path.join(SCRATCH_DIR, "proof_v10_dark.png")
    proof.convert("RGB").save(proof_path, "PNG")
    print(f"[PROOF SAVED] {proof_path}")


if __name__ == "__main__":
    main()
