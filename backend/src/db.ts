import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';

let db: Database | null = null;

// Create database connection
export async function openDb() {
  if (db) return db;
  
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });
  return db;
}

// Initialize database with tables
export async function initializeDb() {
  const database = await openDb();
  
  await database.exec(`
    CREATE TABLE IF NOT EXISTS problems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS problem_questions (
      problem_id INTEGER,
      question_id INTEGER,
      PRIMARY KEY (problem_id, question_id),
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS responses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      problem_id INTEGER,
      response_text TEXT NOT NULL,
      metadata TEXT DEFAULT '{}',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reviewers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS reviewer_assignments (
      reviewer_id INTEGER,
      problem_id INTEGER,
      PRIMARY KEY (reviewer_id, problem_id),
      FOREIGN KEY (reviewer_id) REFERENCES reviewers(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      response_id INTEGER,
      question_id INTEGER,
      reviewer_id INTEGER,
      answer BOOLEAN NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (response_id) REFERENCES responses(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES reviewers(id) ON DELETE CASCADE
    );
  `);

  // Add some sample data
  await database.run(`INSERT OR IGNORE INTO problems (title, description) VALUES 
    ('Math Problem 1', 'Solve the quadratic equation'),
    ('Physics Problem 1', 'Calculate the force needed')`);

  await database.run(`INSERT OR IGNORE INTO questions (text) VALUES 
    ('Is the answer correct?'),
    ('Is the work shown?'),
    ('Is the reasoning clear?')`);

  return database;
}