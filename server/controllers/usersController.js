const pool = require("../config/dbConn");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");

// @desc Get all users
// @router GET /users
// @access Private

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, username, roles, active FROM users"
    );
    const users = result.rows;

    if (!users.length) {
      return res.status(400).json({ message: "No users found" });
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc GC users
// @router POST /users
// @access Private

const createNewUser = asyncHandler(async (req, res) => {
  const { username, password, roles } = req.body;

  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const duplicateCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: "Duplicate username" });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      "INSERT INTO users(username, password, roles) VALUES($1, $2, $3) RETURNING *",
      [username, hashedPwd, roles]
    );

    res
      .status(201)
      .json({ message: `New user ${newUser.rows[0].username} created` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Create new user
// @router PATCH /users
// @access Private

const updateUser = asyncHandler(async (req, res) => {
  const { id, username, roles, active, password } = req.body;

  if (
    !id ||
    !username ||
    !Array.isArray(roles) ||
    !roles.length ||
    typeof active !== "boolean"
  ) {
    return res
      .status(400)
      .json({ message: "All fields except password are required" });
  }

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const duplicateCheck = await pool.query(
      "SELECT id FROM users WHERE username = $1 AND id != $2",
      [username, id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ message: "Duplicate username" });
    }

    const updateUserQuery =
      "UPDATE users SET username = $1, roles = $2, active = $3, password = $4 WHERE id = $5 RETURNING *";
    const hashedPwd = password
      ? await bcrypt.hash(password, 10)
      : userCheck.rows[0].password;
    const updatedUser = await pool.query(updateUserQuery, [
      username,
      roles,
      active,
      hashedPwd,
      id,
    ]);

    res.json({ message: `${updatedUser.rows[0].username} updated` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// @desc Delete a user
// @router DELETE /users
// @access Private

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  try {
    const userCheck = await pool.query("SELECT * FROM users WHERE id = $1", [
      id,
    ]);

    if (userCheck.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const noteCheck = await pool.query(
      "SELECT id FROM notes WHERE user_id = $1",
      [id]
    );

    if (noteCheck.rows.length > 0) {
      return res.status(400).json({ message: "User has assigned notes" });
    }

    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    const reply = `Username ${result.rows[0].username} with ID ${result.rows[0].id} deleted`;

    res.json(reply);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = {
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
