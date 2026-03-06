"""
Step 1: Extract the Cricsheet ZIP archives into `backend/data/extracted`.

This script is intentionally lightweight so it can be rerun safely. The later
steps parse the extracted JSON into player-innings rows, engineer context
features, calculate per-innings impact, and then compute rolling impact.
"""

from pipeline_common import EXTRACTED_DIR, extract_archives


def main() -> None:
    extracted_files = extract_archives()
    print(f"Extracted {len(extracted_files)} JSON files into {EXTRACTED_DIR}")


if __name__ == "__main__":
    main()
