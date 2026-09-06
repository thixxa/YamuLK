import bcrypt from "bcrypt";
import User from "../Models/userModel.js";
import jwt from "jsonwebtoken";

// GET /user/ — list users (protected, no password exposed)
export async function getUsers(req, res) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "getUser error" });
  }
}

// POST /user/ — Login
export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Inputs missing" });
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "No account found with this email" });
    }
    const isPassword = await bcrypt.compare(password, user.password);

    if (!isPassword) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login success", token: token, user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "login error", error });
  }
}

// POST /user/register — Register
export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Fields missing" });
  }

  try {
    // Check for existing email only (name is not a unique field)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    return res.status(201).json({ message: "User successfully Registered" });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: "register error" });
  }
}

// PATCH /user/updateProfile — Update name and/or password
export async function updateProfile(req, res) {
  try {
    const { name, oldPassword, password } = req.body;

    // At least one field must be provided
    if (!name && !password) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findById(req.user._id).select("+password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name if provided
    if (name) {
      user.name = name.trim();
    }

    // Update password if provided
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ message: "Old password is required to change password" });
      }

      const isOldPwdMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isOldPwdMatch) {
        return res.status(400).json({ message: "Old password does not match" });
      }

      const samePassword = await bcrypt.compare(password, user.password);
      if (samePassword) {
        return res.status(400).json({ message: "New password must be different from old password" });
      }

      const hashedNewPassword = await bcrypt.hash(password, 10);
      user.password = hashedNewPassword;
    }

    await user.save();
    return res.status(200).json({ message: "Profile updated successfully", user: { name: user.name, email: user.email } });
  } catch (error) {
    console.error("updateProfile error:", error);
    return res.status(500).json({ message: "update error" });
  }
}
