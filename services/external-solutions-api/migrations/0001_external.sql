CREATE TABLE competitions (
  slug TEXT NOT NULL,
  version TEXT NOT NULL,
  puzzle_count INTEGER NOT NULL CHECK (puzzle_count > 0),
  PRIMARY KEY (slug, version)
);
CREATE TABLE move_sets (
  competition TEXT NOT NULL,
  version TEXT NOT NULL,
  kind TEXT NOT NULL,
  moves_json TEXT NOT NULL,
  PRIMARY KEY (competition, version, kind),
  FOREIGN KEY (competition, version) REFERENCES competitions(slug, version)
);
CREATE TABLE contexts (
  competition TEXT NOT NULL,
  version TEXT NOT NULL,
  puzzle_id INTEGER NOT NULL,
  start_json TEXT NOT NULL,
  goal_json TEXT NOT NULL,
  kind TEXT NOT NULL,
  PRIMARY KEY (competition, version, puzzle_id),
  FOREIGN KEY (competition, version, kind) REFERENCES move_sets (competition, version, kind)
);
CREATE TABLE solutions (
  id TEXT PRIMARY KEY NOT NULL,
  competition TEXT NOT NULL,
  version TEXT NOT NULL,
  puzzle_id INTEGER NOT NULL,
  path_json TEXT NOT NULL,
  length INTEGER NOT NULL,
  FOREIGN KEY (competition, version, puzzle_id) REFERENCES contexts (competition, version, puzzle_id)
);
CREATE INDEX solutions_by_puzzle ON solutions(competition, version, puzzle_id, id);
CREATE TABLE provenances (
  solution_id TEXT NOT NULL REFERENCES solutions(id),
  source_id TEXT NOT NULL,
  source_json TEXT NOT NULL,
  PRIMARY KEY (solution_id, source_id)
);
