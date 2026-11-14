CREATE TABLE players (
    player_id   INT PRIMARY KEY,
    name        TEXT,
    class_year  INT,
    total_games INT DEFAULT 0,
    elo         INT DEFAULT 200
    password    TEXT
);

CREATE TABLE courts (
    court_id    INT PRIMARY KEY,
    court_name  TEXT
);

CREATE TABLE game_sessions (
    session_id   INT PRIMARY KEY,
    session_date DATE,
    elo_bracket  TEXT
);

CREATE TABLE queue (
    queue_id    INT PRIMARY KEY,
    session_id  INT,
    player_id   INT,
    joined_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matches (
    match_id    INT PRIMARY KEY,
    session_id  INT,
    court_id    INT,
    player1_id  INT,
    player2_id  INT,
    winner_id   INT
);

CREATE TABLE elo_history (
    history_id  INT PRIMARY KEY,
    player_id   INT,
    match_id    INT,
    new_elo     INT
);

CREATE VIEW leaderboard AS
SELECT RANK() OVER (ORDER BY elo DESC) AS rank, player_id, name, elo
FROM players;