-- Your SQL goes here
CREATE TABLE file (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    xlx_template TEXT NOT NULL,
    code TEXT NOT NULL,
    created_date date NOT NULL,
    updated_date date NOT NULL
)