CREATE TABLE move_sets (
  version TEXT NOT NULL,
  kind TEXT NOT NULL,
  moves_json TEXT NOT NULL,
  PRIMARY KEY (version, kind)
);
CREATE TABLE contexts (
  version TEXT NOT NULL,
  puzzle_id INTEGER NOT NULL,
  start_json TEXT NOT NULL,
  goal_json TEXT NOT NULL,
  kind TEXT NOT NULL,
  PRIMARY KEY (version, puzzle_id),
  FOREIGN KEY (version, kind) REFERENCES move_sets (version, kind)
);
CREATE TABLE solutions (
  id TEXT PRIMARY KEY NOT NULL,
  version TEXT NOT NULL,
  puzzle_id INTEGER NOT NULL,
  path_json TEXT NOT NULL,
  length INTEGER NOT NULL,
  FOREIGN KEY (version, puzzle_id) REFERENCES contexts (version, puzzle_id)
);
CREATE INDEX solutions_by_puzzle ON solutions(version, puzzle_id, id);
CREATE TABLE provenances (
  solution_id TEXT NOT NULL REFERENCES solutions(id),
  source_id TEXT NOT NULL,
  source_json TEXT NOT NULL,
  PRIMARY KEY (solution_id, source_id)
);
