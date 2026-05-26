ACHIEVEMENTS = {
    'first_pomodoro': {
        'id': 'first_pomodoro',
        'title': 'First Focus',
        'description': 'Complete your first Pomodoro session',
        'icon': 'timer',
        'xp': 0,
        'tier': 'bronze',
    },
    'streak_7': {
        'id': 'streak_7',
        'title': 'Week Warrior',
        'description': '7-day study streak',
        'icon': 'flame',
        'xp': 100,
        'tier': 'silver',
    },
    'streak_30': {
        'id': 'streak_30',
        'title': 'Monthly Master',
        'description': '30-day study streak',
        'icon': 'flame',
        'xp': 500,
        'tier': 'gold',
    },
    'century': {
        'id': 'century',
        'title': 'Century Club',
        'description': 'Complete 100 Pomodoro sessions',
        'icon': 'trophy',
        'xp': 0,
        'tier': 'gold',
    },
    'group_leader': {
        'id': 'group_leader',
        'title': 'Group Leader',
        'description': 'Create a study group',
        'icon': 'users',
        'xp': 0,
        'tier': 'bronze',
    },
    'social_butterfly': {
        'id': 'social_butterfly',
        'title': 'Social Butterfly',
        'description': 'Join 5 study groups',
        'icon': 'users',
        'xp': 0,
        'tier': 'silver',
    },
    'night_owl': {
        'id': 'night_owl',
        'title': 'Night Owl',
        'description': 'Complete a study session after midnight',
        'icon': 'moon',
        'xp': 0,
        'tier': 'bronze',
    },
    'ai_master': {
        'id': 'ai_master',
        'title': 'AI Master',
        'description': 'Use AI tools 50 times',
        'icon': 'brain',
        'xp': 0,
        'tier': 'silver',
    },
    'speed_learner': {
        'id': 'speed_learner',
        'title': 'Speed Learner',
        'description': 'Generate 10 quizzes',
        'icon': 'zap',
        'xp': 0,
        'tier': 'bronze',
    },
}

XP_PER_LEVEL = 500

XP_AWARDS = {
    'pomodoro_complete': 50,
    'group_joined': 20,
    'first_message': 10,
    'quiz_completed': 30,
    'streak_7': 100,
}


def xp_to_level(xp: int) -> int:
    return max(1, xp // XP_PER_LEVEL + 1)


def xp_for_next_level(xp: int) -> int:
    current_level = xp_to_level(xp)
    return current_level * XP_PER_LEVEL - xp
