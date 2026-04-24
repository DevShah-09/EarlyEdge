#!/usr/bin/env python
"""
Standalone ML Training Script
==============================
Run from the project root:

    python ml/train.py                          # Train on sample_patients_50.csv
    python ml/train.py --csv path/to/data.csv  # Train on a custom CSV

Trained models are saved to ./ml/saved_models/
A training_report.json is also written there.
"""
import os
import sys
import argparse
import pandas as pd

# ── Allow imports from the project root ─────────────────────────────────────
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT not in sys.path:
    sys.path.insert(0, ROOT)

# Set MODEL_DIR so models land in ml/saved_models (not backend/ml/saved_models)
os.environ.setdefault("MODEL_DIR", os.path.join(ROOT, "ml", "saved_models"))

from backend.ml.trainer import train_models, models_exist  # noqa: E402


def main():
    parser = argparse.ArgumentParser(description="EarlyEdge — ML Model Trainer")
    parser.add_argument(
        "--csv",
        default=os.path.join(ROOT, "sample_patients_50.csv"),
        help="Path to patient CSV file (default: sample_patients_50.csv)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-train even if models already exist",
    )
    args = parser.parse_args()

    model_dir = os.environ["MODEL_DIR"]
    print(f"[train.py] MODEL_DIR = {model_dir}")

    if models_exist() and not args.force:
        print(
            "[train.py] Existing models found. Pass --force to re-train.\n"
            f"           Models in: {model_dir}"
        )
        return

    if not os.path.exists(args.csv):
        print(f"[train.py] ERROR: CSV not found at '{args.csv}'")
        print("           Provide --csv <path> or place sample_patients_50.csv in the project root.")
        sys.exit(1)

    print(f"[train.py] Loading data from: {args.csv}")
    df = pd.read_csv(args.csv)
    print(f"[train.py] Rows: {len(df)}  Columns: {list(df.columns)}")

    print("[train.py] Starting training …")
    report = train_models(df)

    print("\n═══ Training Summary ═══")
    for condition, info in report.items():
        if info.get("status") == "trained":
            print(
                f"  {condition.upper():15s} → best={info['best_model']:5s}  "
                f"recall={info['best_recall']:.3f}  "
                f"auc={info['models'].get(info['best_model'], {}).get('roc_auc', 'n/a')}"
            )
        else:
            print(f"  {condition.upper():15s} → SKIPPED ({info.get('reason', '?')})")

    report_path = os.path.join(model_dir, "training_report.json")
    print(f"\n[train.py] Full report → {report_path}")
    print("[train.py] Done ✓")


if __name__ == "__main__":
    main()
