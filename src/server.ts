import express = require("express");
import { prisma } from "./prisma";

const port = 3000;
const app = express();

app.use(express.json());

app.get("/movies", async (_, res) => {
  const movies = await prisma.movie.findMany({
    orderBy: { title: "asc" },
    include: {
      genres: true,
      languages: true,
    },
  });
  res.json(movies);
});

app.post("/movies", async (req, res) => {
  const { title, genre_id, language_id, oscar_count, release_date } = req.body;

  try {
    const movieWithSameTitle = await prisma.movie.findFirst({
      where: { title: { equals: title, mode: "insensitive" } },
    });

    if (movieWithSameTitle) {
      return res
        .status(409)
        .send({ message: "Já existe um filme cadastrado com esse título " });
    }

    await prisma.movie.create({
      data: {
        title,
        genre_id,
        language_id,
        oscar_count,
        release_date: new Date(release_date),
      },
    });
  } catch (error) {
    return res.status(500).send({ message: "Falha ao cadastrar filme" });
  }

  res.status(201).send();
});

app.put("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({
      where: {
        id,
      },
    });
    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Falha ao atualizar Filme" });
  }

  const data = { ...req.body };

  data.release_date = data.release_date
    ? new Date(data.release_date)
    : undefined;

  await prisma.movie.update({
    where: {
      id,
    },
    data,
  });

  res.status(200).send();
});

app.delete("/movies/:id", async (req, res) => {
  const id = Number(req.params.id);

  try {
    const movie = await prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      return res.status(404).send({ message: "Filme não encontrado" });
    }
  } catch (error) {
    return res.status(500).send({ message: "Não foi possivel remover filme" });
  }
  await prisma.movie.delete({ where: { id } });

  res.status(200).send();
});

app.get("/movies/:genreName", async (req, res) => {
  try {
    const moviesFilteredByGenre = await prisma.movie.findMany({
      include: {
        genres: true,
        languages: true,
      },
      where: {
        genres: {
          name: {
            equals: req.params.genreName,
            mode: "insensitive",
          },
        },
      },
    });
    res.status(200).send(moviesFilteredByGenre);
  } catch (error) {
    res.status(500).send({ message: "Falha ao filtrar Filmes" });
  }
});

app.listen(port, () => {
  console.log(`servidor em execução na porta ${port}`);
});
