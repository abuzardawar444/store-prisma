import { Request, Response } from "express";

const notFound = (req: Request, res: Response) => {
  res.status(404).json({ msg: "Route doesn't exist" });
};

export default notFound;
