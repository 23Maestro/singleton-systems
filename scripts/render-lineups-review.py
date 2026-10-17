"""Build the shared Pre-Figma and Post-Figma review packet."""
import argparse
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.lineups_review.render import render_episode

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--episode', required=True)
    parser.add_argument('--destination', default='public/decision-maps')
    parser.add_argument('--preview-root')
    args = parser.parse_args()
    print(render_episode(args.episode, args.destination, args.preview_root))
