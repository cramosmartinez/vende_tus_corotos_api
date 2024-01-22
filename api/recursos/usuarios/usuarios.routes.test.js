let request = require("supertest");
let Usuario = require("./usuarios.model");
const { app, server } = require("../../../index");

let dummyUsuarios = [
  {
    username: "daniel",
    email: "daniel@gmail.com",
    password: "holaquetal",
  },
  {
    username: "ricardo",
    email: "ricardo@gmail.com",
    password: "quepaso",
  },
  {
    username: "diego",
    email: "diego@gmail.com",
    password: "nomedigas",
  },
];

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
    test("Si existen usuarios, debería retornarlos en un array", (done) => {
      Promise.all(
        dummyUsuarios.map((usuario) => new Usuario(usuario).save())
      ).then((usuarios) => {
        request(app)
          .get("/usuarios")
          .end((err, res) => {
            expect(res.status).toBe(200);
            expect(res.body).toBeInstanceOf(Array);
            expect(res.body).toHaveLength(3);
            done();
          });
      });
    });
  });
});
