import express = require("express");
import { prisma } from "./prisma";

const port = 3000;
const app = express();

app.get("/movies", async (req, res) => {
  const movies = await prisma.movie.findMany();
  res.json(movies);
});

app.listen(port, () => {
  console.log(`servidor em execução na porta ${port}`);
});
