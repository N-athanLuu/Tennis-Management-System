STARTING_ELO = 200
ELO_PER_WIN = 20
ELO_PER_LOSS = 20
ELO_PER_RANK = 100
RANK_NAMES = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"]
MAX_BRACKET = len (RANK_NAMES) - 1

#Returns the bracket number (0 = Bronze ... MAX_BRACKET = Diamond).
def bracket_for(elo: int) -> int:
    bracket = (elo - STARTING_ELO) // ELO_PER_RANK
    return max(0, min(bracket, MAX_BRACKET))

#Return the display name for a bracket number.
def rank_name(bracket: int) -> str:
    if not 0 <= bracket <= MAX_BRACKET:
        raise ValueError(f'Bracket must be between 0 and {MAX_BRACKET}, got {bracket}.')
    return RANK_NAMES[bracket]

#Return points earned within the current rank (0-99), or None at the top rank.
def progress_in_rank(elo: int) -> int | None:
    if bracket_for(elo) == MAX_BRACKET:
        return None
    return max(0, elo - STARTING_ELO) % ELO_PER_RANK

#Return a player's new elo after a win or loss, never below SARTING_ELO
def elo_after_match(elo: int, won: bool) -> int:
    change = ELO_PER_WIN if won else - ELO_PER_LOSS
    return max(SARTING_ELO, elo + change)

#Return everything that the API needs to show a player's rank.
def rank_info(elo: int) -> dict:
    bracket = bracket_for(elo)
    return{
        'elo': elo,
        'bracket': bracket,
        'rank': rank_name(bracket),
        'progress': progress_in_rank(elo),
        'points_per_rank': ELO_PER_RANK,
    }