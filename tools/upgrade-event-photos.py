#!/usr/bin/env python3
"""Replace an event's gallery photos with full-resolution copies from the camera originals.

The gallery photos in images/events/<id>/ were saved at 2400 px (some at 4000 px),
which is too small to zoom into faces in wide shots of the hall. This finds each
photo's original among the camera files (matched by picture content, so the
camera's DSC_xxxx names don't matter) and re-saves the chosen photos at the
camera's full size: EXIF/GPS removed, rotation applied, progressive JPEG.

  python3 tools/upgrade-event-photos.py ~/Downloads/fs_rsd
  python3 tools/upgrade-event-photos.py ~/Downloads/fs_rsd --photos 6,9,10
  python3 tools/upgrade-event-photos.py ~/Downloads/fs_rsd --all
  python3 tools/upgrade-event-photos.py ~/Downloads/fs_rsd --dry-run

More than one folder of originals can be given. Thumbnails (thumbs/) and
data/events.js need no change: the file names and shapes stay the same.
Needs Pillow (pip install Pillow).
"""
import argparse
import sys
from pathlib import Path

from PIL import Image, ImageChops, ImageOps, ImageStat

ROOT = Path(__file__).resolve().parent.parent

# Wide shots of the hall, group photos and crowds - where faces are small.
WIDE = {
    "rs-day-foundation-day-2026": [6, 9, 10, 11, 16, 17, 18, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 34, 39, 58, 59],
}

FP = (48, 32)  # fingerprint size


def fingerprint(path):
    im = Image.open(path)
    w, h = im.size
    size = (h, w) if im.getexif().get(0x0112, 1) in (5, 6, 7, 8) else (w, h)  # as displayed
    im.draft("L", (FP[0] * 4, FP[1] * 4))  # fast JPEG decode at reduced size
    im = ImageOps.exif_transpose(im).convert("L")
    return size, ImageOps.autocontrast(im.resize(FP, Image.LANCZOS))


def difference(a, b):
    return ImageStat.Stat(ImageChops.difference(a, b)).mean[0]


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("originals", nargs="+", type=Path, help="folder(s) with the camera's original JPGs")
    ap.add_argument("--event", default="rs-day-foundation-day-2026")
    ap.add_argument("--photos", help="photo numbers to upgrade, e.g. 6,9,10 (default: the event's wide shots)")
    ap.add_argument("--all", action="store_true", help="upgrade every photo of the event")
    ap.add_argument("--quality", type=int, default=88)
    ap.add_argument("--dry-run", action="store_true", help="only show the matches")
    args = ap.parse_args()

    folder = ROOT / "images" / "events" / args.event
    photos = sorted(folder.glob("[0-9][0-9]*.jpg"))
    if args.all:
        wanted = photos
    else:
        nums = [int(n) for n in args.photos.split(",")] if args.photos else WIDE.get(args.event, [])
        wanted = [p for p in photos if int(p.stem) in nums]
    if not wanted:
        sys.exit("No photos chosen - pass --photos or --all.")

    sources = sorted({f for d in args.originals for f in d.expanduser().rglob("*") if f.suffix.lower() in (".jpg", ".jpeg")})
    if not sources:
        sys.exit("No JPG files found in " + ", ".join(map(str, args.originals)))
    print(f"Reading {len(sources)} originals ...")
    prints = []
    for f in sources:
        try:
            prints.append((f, *fingerprint(f)))
        except OSError as e:
            print(f"  skipped {f.name}: {e}")

    failed = 0
    for p in wanted:
        size, fp = fingerprint(p)
        ar = size[0] / size[1]
        scored = sorted((difference(fp, sfp), f, ssize) for f, ssize, sfp in prints if abs(ssize[0] / ssize[1] - ar) < 0.02)
        if not scored or scored[0][0] > 12:
            print(f"  {p.name}: no matching original found - left as is")
            failed += 1
            continue
        d, src, ssize = scored[0]
        if ssize[0] <= size[0]:
            print(f"  {p.name}: already {size[0]} px wide (original {src.name} is {ssize[0]}) - left as is")
            continue
        print(f"  {p.name} <- {src.name}  {size[0]}x{size[1]} -> {ssize[0]}x{ssize[1]}  (difference {d:.1f})")
        if len(scored) > 1 and scored[1][0] < d * 2 + 2:  # e.g. burst shots seconds apart
            print(f"      check: {scored[1][1].name} is almost as close ({scored[1][0]:.1f})")
        if args.dry_run:
            continue
        im = ImageOps.exif_transpose(Image.open(src))
        icc = im.info.get("icc_profile")
        im.convert("RGB").save(p, "JPEG", quality=args.quality, optimize=True, progressive=True, subsampling="4:2:0",
                               **({"icc_profile": icc} if icc else {}))
    if failed:
        print(f"{failed} photo(s) had no match - add the folder their originals are in.")


if __name__ == "__main__":
    main()
