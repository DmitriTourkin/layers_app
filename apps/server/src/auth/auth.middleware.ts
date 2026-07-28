import { Request, Response, NextFunction} from "express";
import { ParamsDictionary} from 'express-serve-static-core';
import { verifyToken } from "./auth.service";

export interface AuthedRequest<P = ParamsDictionary> extends Request<P> {
  user?: { userId: string};
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    req.user = verifyToken(header.slice("Bearer ".length));
    next();
  } catch (e) {
    res.status(401).json({ error: "UNAUTHORIZED" });
  }
}