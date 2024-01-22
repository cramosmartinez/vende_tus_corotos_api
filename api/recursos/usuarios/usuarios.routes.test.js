let request = require("supertest");
let Usuario = require("./usuarios.model");
const { app, server } = require("../../../index");

describe("Usuarios", () => {
  beforeEach(async () => {
    await Usuario.deleteMany({});
  });

  afterAll(async () => {
    if (server) {
      await server.close();
    }
  });

  describe("GET /usuarios", () => {
    test("Si no hay usuarios devuelve un array vacío", (done) => {
      request(app)
        .get("/usuarios")
        .end((err, res) => {
          expect(res.statusCode).toBe(200);
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body).toHaveLength(0);
          done();
        });
    });
  });
});
