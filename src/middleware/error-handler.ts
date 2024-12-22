import { NextFunction, Request, Response } from "express";

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(err);
  res.status(500).json({ msg: "Something went wrong, please try again" });
  return;
};

export default errorHandlerMiddleware;
