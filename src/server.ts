import express = require("express");
import { PrismaClient } from "../generated/prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.get("/movies", (req, res) => {
  res.send("Listagem de filmes");
});

app.listen(port, () => {
  console.log(`servidor em execução na porta ${port}`);
});
