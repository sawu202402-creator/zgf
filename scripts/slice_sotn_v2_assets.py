#!/usr/bin/env python3
"""
Slices, chroma-keys, dark-ink defringes, and normalizes all 17 SotN v2 Masterpiece assets:
1. Hero crouch/slide/divekick: h18_crouch, h18_slide, h18_divekick (matched head-scale to h18_idle_0!)
2. Distinct SotN Mobs: mob_book, mob_toad, mob_puppet, mob_gargoyle
3. Thunder Garuda Boss & Sword Familiar: boss_yk_0, boss_yk_1, boss_yk_2, fam_sword
4. Castle Interiors & Clockwork: env_palace_floor, env_indoor_ledge, prop_bookshelf, prop_chandelier, prop_clock_gear (perfect centered square!), prop_lattice_window
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

HERO_CW, HERO_CH = 340, 256
HERO_AX, HERO_FY = 132, 244


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


def normalize_hero_special(pose: Image.Image, target_h: int, ax_offset: int = 0, fy_offset: int = 0) -> Image.Image:
    pw, ph = pose.size
    sc = target_h / float(ph)
    nw = max(1, int(round(pw * sc)))
    nh = max(1, int(round(ph * sc)))
    if nw > HERO_CW - 12:
        sh = (HERO_CW - 12) / float(nw)
        nw = int(round(nw * sh))
        nh = int(round(nh * sh))
    resized = pose.resize((nw, nh), Image.LANCZOS)

    ralpha = resized.getchannel("A").load()
    wsum = 0.0
    wtot = 0.0
    for x in range(nw):
        col = 0
        for y in range(nh):
            if ralpha[x, y] > 60:
                col += 1
        wf = float(col) ** 4
        wsum += x * wf
        wtot += wf
    core_x = int(round(wsum / wtot)) if wtot > 0 else nw // 2

    canvas = Image.new("RGBA", (HERO_CW, HERO_CH), (0, 0, 0, 0))
    px = max(2, min(HERO_CW - nw - 2, HERO_AX + ax_offset - core_x))
    py = max(2, min(HERO_CH - nh - 2, HERO_FY + fy_offset - nh))
    canvas.paste(resized, (px, py), resized)
    return canvas


def main():
    # 1. Hero 18yo Crouch, Slide Kick, Dive Kick
    h_src = os.path.join(ARTIFACT_DIR, "sheet_hero18_crouch_slide3_1795011450744.jpg")
    h_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(h_src)))
    h_poses = slice_x_bands(h_rgba, [(0.01, 0.34), (0.34, 0.695), (0.695, 0.99)])
    hero_specs = [
        ("h18_crouch", 142, 0, 0),
        ("h18_slide", 126, 12, 0),
        ("h18_divekick", 156, 6, -6),
    ]
    hero_outs = []
    for idx, (nm, th, axo, fyo) in enumerate(hero_specs):
        norm = normalize_hero_special(h_poses[idx], th, axo, fyo)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        hero_outs.append((nm, norm))
        print(f"[OK HERO] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")

    # 2. 4 Distinct SotN Monsters
    m_src = os.path.join(ARTIFACT_DIR, "sheet_mobs_sotn4_1795011501171.jpg")
    m_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(m_src)))
    m_poses = slice_x_bands(
        m_rgba,
        [
            (0.005, 0.258),  # mob_book
            (0.258, 0.492),  # mob_toad
            (0.492, 0.748),  # mob_puppet
            (0.748, 0.995),  # mob_gargoyle
        ],
    )
    mob_specs = [
        ("mob_book", 162),
        ("mob_toad", 136),
        ("mob_puppet", 192),
        ("mob_gargoyle", 196),
    ]
    mob_outs = []
    for idx, (nm, th) in enumerate(mob_specs):
        sc = th / float(m_poses[idx].size[1])
        norm = se.normalize_enemy_frame(m_poses[idx], sc)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        mob_outs.append((nm, norm))
        print(f"[OK MOB] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")

    # 3. Thunder Garuda Boss (3 poses) + Sword Familiar
    yk_src = os.path.join(ARTIFACT_DIR, "sheet_boss_yaksha_familiar4_1795011517447.jpg")
    yk_rgba = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(yk_src)))
    yk_poses = slice_x_bands(
        yk_rgba,
        [
            (0.005, 0.308),  # boss_yk_0
            (0.308, 0.548),  # boss_yk_1
            (0.548, 0.852),  # boss_yk_2
            (0.855, 0.992),  # fam_sword
        ],
    )
    yk_scale = 232.0 / float(yk_poses[0].size[1])
    yk_outs = []
    for idx, nm in enumerate(["boss_yk_0", "boss_yk_1", "boss_yk_2"]):
        norm = se.normalize_enemy_frame(yk_poses[idx], yk_scale)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        norm.save(out_p, "WEBP", quality=92, method=4)
        yk_outs.append((nm, norm))
        print(f"[OK BOSS] {nm}.webp {norm.size} ({os.path.getsize(out_p)//1024} KB)")

    fam_raw = yk_poses[3]
    fsc = 124.0 / float(fam_raw.size[1])
    fam_out = fam_raw.resize((max(1, int(round(fam_raw.size[0] * fsc))), 124), Image.LANCZOS)
    fam_p = os.path.join(OUT_DIR, "fam_sword.webp")
    fam_out.save(fam_p, "WEBP", quality=92, method=4)
    print(f"[OK FAMILIAR] fam_sword.webp {fam_out.size} ({os.path.getsize(fam_p)//1024} KB)")

    # 4. Indoor Palace Marble Floor Strip (`env_palace_floor.webp`)
    pf_src = os.path.join(ARTIFACT_DIR, "env_2d_palace_marble_1795011454716.jpg")
    pf_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(pf_src)))
    bb = pf_clean.getbbox()
    if bb:
        pf_clean = pf_clean.crop(bb)
    pw, ph = pf_clean.size
    trim_x = int(pw * 0.02)
    pf_clean = pf_clean.crop((trim_x, 0, pw - trim_x, ph))
    nh = 128
    nw = int(round(pf_clean.size[0] * (nh / float(pf_clean.size[1]))))
    pf_out = pf_clean.resize((nw, nh), Image.LANCZOS)
    pf_out.save(os.path.join(OUT_DIR, "env_palace_floor.webp"), "WEBP", quality=90, method=4)
    print(f"[OK ENV] env_palace_floor.webp {pf_out.size}")

    # 5. Indoor Rosewood Mezzanine Balcony (`env_indoor_ledge.webp`)
    il_src = os.path.join(ARTIFACT_DIR, "env_2d_indoor_balcony_1795011470828.jpg")
    il_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(il_src)))
    bb = il_clean.getbbox()
    if bb:
        il_clean = il_clean.crop(bb)
    lw, lh = il_clean.size
    target_lw = 380
    target_lh = int(round(lh * (target_lw / float(lw))))
    il_out = il_clean.resize((target_lw, target_lh), Image.LANCZOS)
    il_out.save(os.path.join(OUT_DIR, "env_indoor_ledge.webp"), "WEBP", quality=90, method=4)
    print(f"[OK ENV] env_indoor_ledge.webp {il_out.size}")

    # 6. 4 Castle Interior Props (`prop_bookshelf`, `prop_chandelier`, `prop_clock_gear`, `prop_lattice_window`)
    ci_src = os.path.join(ARTIFACT_DIR, "sheet_castle_interiors4_1795011528162.jpg")
    ci_clean = dp.dark_ink_defringe(pa.remove_chroma_bg(Image.open(ci_src)))
    ci_items = slice_x_bands(
        ci_clean,
        [
            (0.005, 0.305),  # prop_bookshelf
            (0.305, 0.508),  # prop_chandelier
            (0.508, 0.760),  # prop_clock_gear
            (0.760, 0.992),  # prop_lattice_window
        ],
    )
    prop_outs = []
    for idx, (nm, target_h) in enumerate(
        [
            ("prop_bookshelf", 270),
            ("prop_chandelier", 210),
            ("prop_clock_gear", 220),
            ("prop_lattice_window", 265),
        ]
    ):
        im = ci_items[idx]
        if nm == "prop_clock_gear":
            # Force exact centered square so continuous rotation around center has 0px wobble!
            side = target_h
            sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            sc = (side - 4) / float(max(im.size[0], im.size[1]))
            gw = int(round(im.size[0] * sc))
            gh = int(round(im.size[1] * sc))
            gres = im.resize((gw, gh), Image.LANCZOS)
            sq.paste(gres, ((side - gw) // 2, (side - gh) // 2), gres)
            p_out = sq
        else:
            sc = target_h / float(im.size[1])
            p_out = im.resize((max(1, int(round(im.size[0] * sc))), target_h), Image.LANCZOS)
        out_p = os.path.join(OUT_DIR, f"{nm}.webp")
        p_out.save(out_p, "WEBP", quality=90, method=4)
        prop_outs.append((nm, p_out))
        print(f"[OK PROP] {nm}.webp {p_out.size} ({os.path.getsize(out_p)//1024} KB)")

    # Build dark-night visual verification sheet!
    proof = Image.new("RGB", (1480, 980), (8, 12, 22))
    draw = ImageDraw.Draw(proof)

    # Row 1: h18_idle_0 reference + crouch + slide + divekick
    idle_ref = Image.open(os.path.join(OUT_DIR, "h18_idle_0.webp"))
    draw.line([(0, 8 + HERO_FY), (1480, 8 + HERO_FY)], fill=(65, 85, 115), width=1)
    for ci, (nm, im) in enumerate([("h18_idle_0 (ref)", idle_ref)] + hero_outs):
        x0 = ci * 350 + 10
        proof.paste(im, (x0, 8), im)
        draw.text((x0 + 12, 12), nm, fill=(246, 220, 141))

    # Row 2: 4 SotN Mobs
    draw.line([(0, 275 + se.FOOT_Y), (1480, 275 + se.FOOT_Y)], fill=(65, 85, 115), width=1)
    for ci, (nm, im) in enumerate(mob_outs):
        x0 = ci * 365 + 10
        proof.paste(im, (x0, 275), im)
        draw.text((x0 + 12, 280), nm, fill=(246, 220, 141))

    # Row 3: Thunder Garuda Boss + Familiar + Interior Props
    for ci, (nm, im) in enumerate(yk_outs):
        x0 = ci * 340 + 10
        proof.paste(im, (x0, 545), im)
        draw.text((x0 + 12, 550), nm, fill=(246, 220, 141))
    proof.paste(fam_out, (1040, 620), fam_out)
    draw.text((1040, 598), "fam_sword", fill=(125, 211, 252))

    # Bottom right: indoor ledge + gear + bookshelf + chandelier + window thumbnails
    proof.paste(il_out.resize((260, int(il_out.size[1] * 260 / il_out.size[0]))), (1180, 560), il_out.resize((260, int(il_out.size[1] * 260 / il_out.size[0]))))
    draw.text((1180, 544), "env_indoor_ledge", fill=(246, 220, 141))

    px = 20
    for nm, im in prop_outs:
        th_im = im.resize((int(im.size[0] * 145 / im.size[1]), 145), Image.LANCZOS)
        proof.paste(th_im, (px, 820), th_im)
        draw.text((px, 966), nm, fill=(246, 220, 141))
        px += th_im.size[0] + 36

    pf_th = pf_out.resize((380, 82), Image.LANCZOS)
    proof.paste(pf_th, (860, 865), pf_th)
    draw.text((860, 846), "env_palace_floor", fill=(246, 220, 141))

    proof_p = os.path.join(ARTIFACT_DIR, "scratch", "verify_sotn_v2.png")
    proof.save(proof_p)
    print(f"[PROOF] {proof_p}")


if __name__ == "__main__":
    main()
