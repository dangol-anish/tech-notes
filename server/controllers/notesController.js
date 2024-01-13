const asyncHandler = require("express-async-handler");
const pool = require("../config/dbConn");
// @desc Get all notes
// @route GET /notes
// @access Private
const getAllNotes = asyncHandler(async (req, res) => {
  try {
    // Get all notes from PostgreSQL
    const result = await pool.query("SELECT * FROM notes");
    const notes = result.rows;

    // If no notes
    if (!notes?.length) {
      return res.status(400).json({ message: "No notes found" });
    }

    // Add username to each note before sending the response
    const notesWithUser = await Promise.all(
      notes.map(async (note) => {
        const userResult = await pool.query(
          "SELECT * FROM users WHERE id = $1",
          [note.user_id]
        );
        const user = userResult.rows[0];
        return { ...note, username: user.username };
      })
    );

    res.json(notesWithUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = asyncHandler(async (req, res) => {
  const { user_id, title, text } = req.body;

  // Confirm data
  if (!user_id || !title || !text) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Check for duplicate title
  const duplicateResult = await pool.query(
    "SELECT * FROM notes WHERE title = $1",
    [title]
  );
  const duplicate = duplicateResult.rows[0];

  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  // Create and store the new note
  await pool.query(
    "INSERT INTO notes (user_id, title, text) VALUES ($1, $2, $3)",
    [user_id, title, text]
  );

  // Created
  res.status(201).json({ message: "New note created" });
});

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = asyncHandler(async (req, res) => {
  const { id, user_id, title, text, completed } = req.body;

  // Confirm data
  if (!id || !user_id || !title || !text || typeof completed !== "boolean") {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Confirm note exists to update
  const noteResult = await pool.query("SELECT * FROM notes WHERE id = $1", [
    id,
  ]);
  const note = noteResult.rows[0];

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  // Check for duplicate title
  const duplicateResult = await pool.query(
    "SELECT * FROM notes WHERE title = $1 AND id <> $2",
    [title, id]
  );
  const duplicate = duplicateResult.rows[0];

  // Allow renaming of the original note
  if (duplicate) {
    return res.status(409).json({ message: "Duplicate note title" });
  }

  await pool.query(
    "UPDATE notes SET user_id = $1, title = $2, text = $3, completed = $4 WHERE id = $5",
    [user_id, title, text, completed, id]
  );

  res.json(`'${title}' updated`);
});

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "Note ID required" });
  }

  // Confirm note exists to delete
  const noteResult = await pool.query("SELECT * FROM notes WHERE id = $1", [
    id,
  ]);
  const note = noteResult.rows[0];

  if (!note) {
    return res.status(400).json({ message: "Note not found" });
  }

  await pool.query("DELETE FROM notes WHERE id = $1", [id]);

  res.json(`Note '${note.title}' with ID ${id} deleted`);
});

module.exports = {
  getAllNotes,
  createNewNote,
  updateNote,
  deleteNote,
};
