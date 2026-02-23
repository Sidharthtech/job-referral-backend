const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

module.exports = ({ req }) => {
  const authHeader = req.headers.authorization || "";
  let user = null;

  if (authHeader) {
    try {
      user = jwt.verify(
        authHeader.replace("Bearer ", ""),
        process.env.JWT_SECRET
      );
    } catch (err) {
      user = null;
    }
  }

  return { prisma, user };
};