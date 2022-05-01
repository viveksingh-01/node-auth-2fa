import express, { Request, Response } from "express";
import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(async () => {
    console.log("Connected to the database.");

    const app = express();

    app.get("/", (req: Request, res: Response) => {
      res
        .status(200)
        .send("Welcome to Two-Factor Authentication using Node.js");
    });

    const PORT = 5000;
    app.listen(PORT, () => {
      console.log(`Server started and listening at port ${PORT}`);
    });
  })
  .catch((error) => console.log(error));
