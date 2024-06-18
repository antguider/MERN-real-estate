import bcrypt from "bcrypt";
import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid crdentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentails" });
    }

    const cookie = jwt.sign(
      {
        id: user.id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: 1000 * 60 * 60 * 24 * 7 }
    );

    res.cookie("token", cookie, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    }).status(200).json({ message: "Login Successful !!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error });
  }
};
export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout successful !!" });
};
export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hasedPassword = await bcrypt.hash(password, 10);
    //Create new user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hasedPassword,
      },
    });
    res.status(201).json({ message: "user created successfully !!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error creating the user" });
  }
};
