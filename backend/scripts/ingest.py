"""
Compatibility wrapper for the old ingest entrypoint.

Running this file now executes the full staged pipeline:
1. extract_dataset.py
2. parse_matches.py
3. feature_engineering.py
4. impact_calculator.py
5. rolling_impact.py
"""

from extract_dataset import main as extract_main
from feature_engineering import main as feature_main
from impact_calculator import main as impact_main
from parse_matches import main as parse_main
from rolling_impact import main as rolling_main


def main() -> None:
    extract_main()
    parse_main()
    feature_main()
    impact_main()
    rolling_main()
    print("Full impact pipeline completed successfully.")


if __name__ == "__main__":
    main()
