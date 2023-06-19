import express from "express";
import { config } from "dotenv";
import ProductsController from "./controllers/products";
config();

export default class App {
    public server: express.Application;
    private productsController = new ProductsController();

    constructor() {
        this.server = express();
        this.middleware();
        this.router();
    }

    private middleware() {
        this.server.use(express.json());
    }

    private router() {
        const router = express.Router();

        router.get("/", this.productsController.find);
        router.post("/", this.productsController.insert);

        // just added this to create the table because I couldn't find an easy way
        // to create them when starting the container :(
        router.post("/init", this.productsController.createTable);
        router.post("/init", this.productsController.dropTable);

        this.server.use(router);
    }
}
