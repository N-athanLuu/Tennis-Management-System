CREATE TABLE players (
    student_id VARCHAR(9) PRIMARY KEY,
    name TEXT NOT NULL,
    class_year INT,
    total_games INT DEFAULT 0,
    elo INT DEFAULT 200,
    password TEXT NOT NULL,
    is_manager BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE game_sessions (
    session_id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    session_date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    elo_bracket INT DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE
);

CREATE TABLE courts (
    court_id SERIAL PRIMARY KEY,
    court_name TEXT NOT NULL UNIQUE,
    active_session_id INT REFERENCES game_sessions(session_id) ON DELETE SET NULL
);

CREATE TABLE queue (
    queue_id SERIAL PRIMARY KEY,
    session_id INT NOT NULL REFERENCES game_sessions(session_id) ON DELETE CASCADE,
    student_id VARCHAR(9) NOT NULL REFERENCES players(student_id) ON DELETE CASCADE,
    joined_at TIMESTAMP DEFAULT NOW(),
    UNIQUE (session_id, student_id)
);

CREATE TABLE matches (
    match_id SERIAL PRIMARY KEY,
    session_id INT REFERENCES game_sessions(session_id) ON DELETE SET NULL,
    court_id INT NOT NULL REFERENCES courts(court_id),
    player1_id VARCHAR(9) NOT NULL REFERENCES players(student_id),
    player2_id VARCHAR(9) NOT NULL REFERENCES players(student_id),
    winner_id VARCHAR(9) REFERENCES players(student_id),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP  
);

CREATE TABLE elo_history (
    history_id SERIAL PRIMARY KEY,
    student_id VARCHAR(9) NOT NULL REFERENCES players(student_id) ON DELETE CASCADE,
    match_id INT REFERENCES matches(match_id) ON DELETE SET NULL,
    new_elo INT NOT NULL
);

CREATE VIEW leaderboard AS
SELECT RANK() OVER (ORDER BY elo DESC) AS rank, student_id, name, elo
FROM players;
