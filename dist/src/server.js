"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const prisma_1 = require("./prisma");
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_json_1 = __importDefault(require("../swagger.json"));
const port = 3000;
const app = express();
app.use(express.json());
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_json_1.default));
app.get("/movies", async (_, res) => {
    const movies = await prisma_1.prisma.movie.findMany({
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
        const movieWithSameTitle = await prisma_1.prisma.movie.findFirst({
            where: { title: { equals: title, mode: "insensitive" } },
        });
        if (movieWithSameTitle) {
            return res
                .status(409)
                .send({ message: "Já existe um filme cadastrado com esse título " });
        }
        await prisma_1.prisma.movie.create({
            data: {
                title,
                genre_id,
                language_id,
                oscar_count,
                release_date: new Date(release_date),
            },
        });
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao cadastrar filme" });
    }
    res.status(201).send();
});
app.put("/movies/:id", async (req, res) => {
    const id = Number(req.params.id);
    try {
        const movie = await prisma_1.prisma.movie.findUnique({
            where: {
                id,
            },
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
    }
    catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar Filme" });
    }
    const data = { ...req.body };
    data.release_date = data.release_date
        ? new Date(data.release_date)
        : undefined;
    await prisma_1.prisma.movie.update({
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
        const movie = await prisma_1.prisma.movie.findUnique({ where: { id } });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado" });
        }
    }
    catch (error) {
        return res.status(500).send({ message: "Não foi possivel remover filme" });
    }
    await prisma_1.prisma.movie.delete({ where: { id } });
    res.status(200).send();
});
app.get("/movies/:genreName", async (req, res) => {
    try {
        const moviesFilteredByGenre = await prisma_1.prisma.movie.findMany({
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
    }
    catch (error) {
        res.status(500).send({ message: "Falha ao filtrar Filmes" });
    }
});
app.listen(port, () => {
    console.log(`Servidor em execução na porta: http://localhost:${port}`);
    console.log(`Acesse a documentação em: http://localhost:${port}/docs`);
});
//# sourceMappingURL=server.js.map