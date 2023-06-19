import ConnectDB from "../database/connectdb";
import { Request, Response } from "express";
import { Redis } from "ioredis";
import { config } from "dotenv";
config();

interface IBook {
    title: string;
}

const redis = new Redis(
    `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@redis:6379`
);

export default class ProductsController {
    constructor() {}

    public async find(req: Request, res: Response) {
        try {
            let books: IBook[];

            const cachedResult = await redis.get("FIND_BOOKS");
            if (cachedResult) {
                console.log("Data from cache");
                books = JSON.parse(cachedResult);
            } else {
                const database = new ConnectDB();
                books = await database.query(`SELECT * FROM books;`);

                if (books.length > 0) {
                    try {
                        await redis.setex(
                            "FIND_BOOKS",
                            5,
                            JSON.stringify(books)
                        );
                    } catch (error) {
                        console.error("Something happened to Redis", error);
                    }
                }
            }

            res.status(200).send({ data: books, error: null });
        } catch (error) {
            console.error(error);
            res.status(500).send({ data: null, error: "something went wrong" });
        }
    }

    public async insert(req: Request, res: Response) {
        try {
            const book: IBook = { title: req.body.title };

            const database = new ConnectDB();
            await database.query(`INSERT INTO books (title) VALUES ($1)`, [
                book.title,
            ]);

            try {
                await redis.del("FIND_BOOKS");
            } catch (error) {
                console.error("Something happened to Redis", error);
            }

            res.status(200).send({
                data: `Book ${book.title} inserted successfully!`,
                error: null,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ data: null, error: "something went wrong" });
        }
    }

    public async createTable(req: Request, res: Response) {
        try {
            const database = new ConnectDB();
            await database.query(
                ` CREATE TABLE books (id SERIAL PRIMARY KEY, title VARCHAR UNIQUE);`
            );

            res.status(200).send({
                data: "Relation books created successfully.",
                error: null,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ data: null, error: "something went wrong" });
        }
    }

    public async dropTable(req: Request, res: Response) {
        try {
            const database = new ConnectDB();
            const response = await database.query(`DROP TABLE books;`);
            const books: IBook[] = response;

            res.status(200).send({
                data: "Relation books deleted successfullt",
                error: null,
            });
        } catch (error) {
            console.error(error);
            res.status(500).send({ data: null, error: "something went wrong" });
        }
    }
}
