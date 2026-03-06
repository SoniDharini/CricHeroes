import unittest
from types import SimpleNamespace

from app.services.impact_engine import (
    compute_impact_components,
    normalize_with_neutral,
    recency_weights,
    rolling_weighted_average,
)


class ImpactEngineTests(unittest.TestCase):
    def test_recency_weights_for_last_ten_innings(self):
        self.assertEqual(recency_weights(10), [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])

    def test_neutral_preserving_normalization(self):
        normalized = normalize_with_neutral([-10.0, 0.0, 10.0])
        self.assertEqual(normalized, [0.0, 50.0, 100.0])

    def test_weighted_average_favors_recent_scores(self):
        values = [10.0, 10.0, 10.0, 100.0]
        self.assertGreater(rolling_weighted_average(values), 32.5)

    def test_pressure_context_increases_positive_raw_impact(self):
        inning = SimpleNamespace(
            format="T20",
            runs=55,
            balls=34,
            strike_rate=161.76,
            boundary_percentage=0.3529,
            batting_position=3,
            wickets_fallen_when_batting=4,
            is_not_out=False,
            wickets=0,
            overs=0.0,
            economy=0.0,
            dot_ball_percentage=0.0,
            match_phase="Death",
            opposition_strength=1.12,
            required_run_rate=11.4,
            match_importance=1.15,
            is_chase=True,
            won_match=True,
            result="win",
        )
        components = compute_impact_components(inning)
        self.assertGreater(components.context_multiplier, 1.0)
        self.assertGreater(components.situation_multiplier, 1.0)
        self.assertGreater(components.raw_impact, 0.0)


if __name__ == "__main__":
    unittest.main()
