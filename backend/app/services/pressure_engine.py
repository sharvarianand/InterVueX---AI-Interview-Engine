"""
Pressure Simulation Engine

Triggers:
- Faster follow-ups
- Conceptual questions
- Reduced hints
- Defensive probing

Makes InterVueX feel like a real interviewer, not a bot.
"""


class PressureEngine:
    """Manages interview pressure and difficulty escalation."""

    def __init__(self):
        self.level = 0.5  # Initial pressure: 0.0 (easy) to 1.0 (intense)
        self.consecutive_good = 0
        self.consecutive_weak = 0

    def get_level(self) -> float:
        """Get current pressure level."""
        return self.level

    def adjust(self, evaluation: dict):
        """Adjust pressure based on answer evaluation."""
        score = evaluation.get("score", 0.5)

        if score >= 0.7:
            self.consecutive_good += 1
            self.consecutive_weak = 0
            # Increase pressure after 2 good answers
            if self.consecutive_good >= 2:
                self.level = min(1.0, self.level + 0.15)
        elif score < 0.4:
            self.consecutive_weak += 1
            self.consecutive_good = 0
            # Decrease pressure after 2 weak answers
            if self.consecutive_weak >= 2:
                self.level = max(0.2, self.level - 0.1)
        else:
            # Average answer - slight adjustment toward middle
            if self.level > 0.5:
                self.level -= 0.05
            elif self.level < 0.5:
                self.level += 0.05
            self.consecutive_good = 0
            self.consecutive_weak = 0

    def get_modifiers(self) -> dict:
        """Get question modifiers based on pressure level."""
        if self.level >= 0.8:
            return {
                "time_pressure": "high",
                "follow_up_likelihood": 0.9,
                "multi_part_questions": True,
                "defensive_probing": True,
                "hint_availability": "none",
            }
        elif self.level >= 0.6:
            return {
                "time_pressure": "medium",
                "follow_up_likelihood": 0.7,
                "multi_part_questions": True,
                "defensive_probing": False,
                "hint_availability": "limited",
            }
        elif self.level >= 0.4:
            return {
                "time_pressure": "normal",
                "follow_up_likelihood": 0.5,
                "multi_part_questions": False,
                "defensive_probing": False,
                "hint_availability": "available",
            }
        else:
            return {
                "time_pressure": "relaxed",
                "follow_up_likelihood": 0.3,
                "multi_part_questions": False,
                "defensive_probing": False,
                "hint_availability": "generous",
            }

    def reset(self):
        """Reset pressure to initial state."""
        self.level = 0.5
        self.consecutive_good = 0
        self.consecutive_weak = 0
