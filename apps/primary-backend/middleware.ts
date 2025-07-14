import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ mesaage: "Unautherized" });
    return;
  }

  const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY!, {
    algorithms: ["RS256"],
  });
  if (!decoded) {
    res.status(401).json({ message: "Unautherized" });
    return;
  }

  const userId = (decoded as any).sub;

  if (!userId) {
    res.status(401).json({ message: "Unautherized" });
    return;
  }

  req.userId = userId;
  next();
};
