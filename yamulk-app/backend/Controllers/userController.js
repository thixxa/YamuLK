import bcrypt from "bcrypt";
import User from "../Models/userModel.js";
import jwt from "jsonwebtoken"

export async function getUsers(req, res) {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "getUser error" }, error);
  }
}

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

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(500).json({ message: "Fields misssing" });
  }

  try {
    const existingUser = await User.findOne({
      $or: [{ name }, { email }],
    });

    if (existingUser) {
      if (existingUser.name === name) {
        return res.status(409).json({
          message: "Username already exists",
        });
      }

      if (existingUser.email === email) {
        return res.status(409).json({
          message: "Email already exists",
        });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });
    await user.save();
    return res.status(200).json({ message: "User successfully Registered..." });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "register error" });
  }
}
