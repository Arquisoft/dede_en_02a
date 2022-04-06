import bp from "body-parser";
import cors from "cors";
import express, { Application, RequestHandler } from "express";
import promBundle from "express-prom-bundle";
import { Server } from "http";
import morgan from "morgan";
import request, { Response } from "supertest";
import apiProduct from "../products/ProductRoutes";
import apiUsers from "../users/UserRoutes";

var server: Server;
const { v4: uuidv4 } = require("uuid");

let helmet = require("helmet");

const app: Application = express();

const mongoose = require("mongoose");
const connectionString =
  "mongodb+srv://test:test@cluster0.uzcmm.mongodb.net/test?retryWrites=true&w=majority";

beforeAll(async () => {
  const metricsMiddleware: RequestHandler = promBundle({ includeMethod: true });
  app.use(metricsMiddleware);

  app.use(cors());
  app.use(bp.json());

  app.use(bp.urlencoded({ extended: false }));
  app.use(morgan("dev"));

  app.use(apiUsers);
  app.use(apiProduct);

  app.use(helmet.hidePoweredBy());

  server = app.listen(5000);

  mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
  server.close();
  mongoose.connection.close();
});

describe("prodcuts", () => {
  /**
   * Test that we can get the products without error
   */
  it("Can get all products", async () => {
    const response: Response = await request(app).get("/products");
    expect(response.statusCode).toBe(200);
    expect(response.type).toEqual("application/json");
  });

  /**
   * Test that we can get a concrete product
   */
  it("Can get a product", async () => {
    const response: Response = await request(app).get(
      "/products/findByCode/0001"
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: "0001",
        name: "Super SUS T-Shirt",
        price: 9.5,
        image: "0001.png",
        category: "Clothes",
      })
    );
  });

  /**
   * Test that we can't get a non existing product'
   */
  it("Can't get non existing product", async () => {
    const response: Response = await request(app).get("/products/findByCode/0");
    expect(response.statusCode).toBe(412);
  });

  let productCode = uuidv4();
  it("Can't create a product without token", async () => {
    const response: Response = await request(app).post("/products").send({
      code: productCode,
      name: "testProduct",
      price: 0.99,
      description: "Another test product",
      stock: 0,
      category: "Clothes",
    });
    expect(response.statusCode).toBe(403);
  });

  /*
  To create a product the user must be registered and also be a manager or admin role
  */
  it("Can create a product correctly", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products")
      .set("token", userToken)
      .set("email", "test")
      .send({
        code: productCode,
        name: "testProduct",
        price: 0.99,
        description: "Another test product",
        stock: 0,
        category: "Clothes",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.name).toBe("testProduct");
    expect(response.body.stock).toBe(0);
  });

  it("Can't create a product with same code", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products")
      .set("token", userToken)
      .set("email", "test")
      .send({
        code: productCode,
        name: "testFailProduct",
        price: 0.99,
        description: "A failure insert test product",
        stock: 0,
        category: "Clothes",
      });
    expect(response.statusCode).toBe(409);
  });

  it("Can't create a product without all values", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products")
      .set("token", userToken)
      .set("email", "test")
      .send({
        name: "testFailProduct",
      });
    expect(response.statusCode).toBe(412);
  });

  it("Can't create a product with incorrect or missing category", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products")
      .set("token", userToken)
      .set("email", "test")
      .send({
        code: uuidv4(),
        name: "testFailProduct",
        price: 0.99,
        description: "A failure insert test product",
        stock: 0,
        category: "Nothing",
      });
    expect(response.statusCode).toBe(412);
  });

  it("Can update a product correctly", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products/update/" + productCode)
      .set("token", userToken)
      .set("email", "test")
      .send({
        stock: 10,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body.stock).toBe(10);
  });

  it("Can't update a product without being admin or manager", async () => {
    const token: Response = await request(app)
      .post("/users/requestToken/")
      .send({
        email: "test1",
        password: "test",
      });
    const response: Response = await request(app)
      .post("/products/update/" + productCode)
      .set("token", token.body)
      .set("email", "test1")
      .send({
        stock: 10,
      });
    expect(response.statusCode).toBe(403);
  });

  it("Can't update a product without token", async () => {
    const response: Response = await request(app)
      .post("/products/update/" + productCode)
      .send({
        stock: 10,
      });
    expect(response.statusCode).toBe(403);
  });

  it("Can delete a product correctly", async () => {
    let userToken = await getToken();
    const response: Response = await request(app)
      .post("/products/delete/" + productCode)
      .set("token", userToken)
      .set("email", "test")
      .send();
    expect(response.statusCode).toBe(200);
  });

  it("Can't delete a product without token", async () => {
    const response: Response = await request(app)
      .post("/products/delete/" + productCode)
      .send();
    expect(response.statusCode).toBe(403);
  });

  /*
   Testing filtering and ordering products
   */
  it("Can filter by category", async () => {
    const response: Response = await request(app)
      .get("/products/filter&order/Electronics&A")
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "Electronics" }),
      ])
    );
  });

  it("Can filter by category and order by price", async () => {
    const response: Response = await request(app)
      .get("/products/filter&order/Electronics&asc")
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "Electronics" }),
      ])
    );
    expect(response.body[0].price).toBe(20.99);
  });

  it("Can order by price", async () => {
    const response: Response = await request(app)
      .get("/products/filter&order/Category&asc")
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body[0].price).toBe(1.99);
  });

  it("Check normal order when 'wrong' input", async () => {
    const response: Response = await request(app)
      .get("/products/filter&order/a&a")
      .send();
    expect(response.statusCode).toBe(200);
    expect(response.body[0].price).toBe(12.95);
    expect(response.body[0].code).toBe("1234");
    expect(response.body[1].price).toBe(9.5);
    expect(response.body[1].code).toBe("0001");
  });
});

async function getToken() {
  const token: Response = await request(app).post("/users/requestToken/").send({
    email: "test",
    password: "test",
  });
  return token.body;
}