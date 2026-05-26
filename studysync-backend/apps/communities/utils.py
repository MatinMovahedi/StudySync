import math


def compute_hot_score(score: int, created_at) -> float:
    epoch = created_at.timestamp()
    order = math.log10(max(abs(score), 1))
    sign = 1 if score > 0 else (-1 if score < 0 else 0)
    return round(sign * order + epoch / 45000, 7)
