import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
};
