import express, { Request, Response } from "express";

const app = express();

app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Welcome to Two-Factor Authentication using Node.js");
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server started and listening at port ${PORT}`);
});
