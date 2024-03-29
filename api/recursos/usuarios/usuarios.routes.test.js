let request = require("supertest");
let bcrypt = require("bcryptjs");
let jwt = require("jsonwebtoken");
let mongoose = require("mongoose");

let Usuario = require("./usuarios.model");
let app = require("../../../index").app;
let server = require("../../../index").server;
let config = require("../../../config");

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

function usuarioExisteYAtributosSonCorrectos(usuario, done) {
  Usuario.find({ username: usuario.username })
    .then((usuarios) => {
      expect(usuarios).toBeInstanceOf(Array);
      expect(usuarios).toHaveLength(1);
      expect(usuarios[0].username).toEqual(usuario.username);
      expect(usuarios[0].email).toEqual(usuario.email);

      let iguales = bcrypt.compareSync(usuario.password, usuarios[0].password);
      expect(iguales).toBeTruthy();
      done();
    })
    .catch((err) => {
      done(err);
    });
}

async function usuarioNoExiste(usuario, done) {
  try {
    let usuarios = await Usuario.find().or([
      { username: usuario.username },
      { email: usuario.email },
    ]);
    expect(usuarios).toHaveLength(0);
    done();
  } catch (err) {
    done(err);
  }
}

describe("Usuarios", () => {
  beforeEach(async () => {
    await Usuario.deleteMany({});
  });

  afterAll(async () => {
    server.close();
    await mongoose.disconnect();
  });

  describe("GET /usuarios", () => {
    test("Si no hay usuarios, debería retornar un array vació", (done) => {
      request(app)
        .get("/usuarios")
        .end((err, res) => {
          expect(res.status).toBe(200);
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

  describe("POST /usuarios", () => {
    test("Un usuario que cumple las condiciones debería ser creado", (done) => {
      request(app)
        .post("/usuarios")
        .send(dummyUsuarios[0])
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe("string");
          expect(res.text).toEqual("Usuario creado exitósamente.");
          usuarioExisteYAtributosSonCorrectos(dummyUsuarios[0], done);
        });
    });

    test("Crear un usuario con un username ya registrado debería fallar", (done) => {
      Promise.all(
        dummyUsuarios.map((usuario) => new Usuario(usuario).save())
      ).then((usuarios) => {
        request(app)
          .post("/usuarios")
          .send({
            username: "daniel",
            email: "danielnuevoemail@gmail.com",
            password: "cuidadoarriba",
          })
          .end((err, res) => {
            expect(res.status).toBe(409);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    test("Crear un usuario con un email ya registrado debería fallar", (done) => {
      Promise.all(
        dummyUsuarios.map((usuario) => new Usuario(usuario).save())
      ).then((usuarios) => {
        request(app)
          .post("/usuarios")
          .send({
            username: "nuevodaniel",
            email: "daniel@gmail.com",
            password: "cuidadoarriba",
          })
          .end((err, res) => {
            expect(res.status).toBe(409);
            expect(typeof res.text).toBe("string");
            done();
          });
      });
    });

    test("Un usuario sin username no debería ser creado", (done) => {
      request(app)
        .post("/usuarios")
        .send({
          email: "daniel@gmail.com",
          password: "contraseña",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario sin contraseña no debería ser creado", (done) => {
      request(app)
        .post("/usuarios")
        .send({
          username: "daniel",
          email: "daniel@gmail.com",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario sin email no debería ser creado", (done) => {
      request(app)
        .post("/usuarios")
        .send({
          username: "daniel",
          password: "contraseña",
        })
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Un usuario con un email inválido no debería ser creado", (done) => {
      let usuario = {
        username: "daniel",
        email: "@gmail.com",
        password: "contraseña",
      };
      request(app)
        .post("/usuarios")
        .send(usuario)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          usuarioNoExiste(usuario, done);
        });
    });

    test("Un usuario con un username con menos de 3 caracteres no debería ser creado", (done) => {
      let usuario = {
        username: "da",
        email: "daniel@gmail.com",
        password: "contraseña",
      };
      request(app)
        .post("/usuarios")
        .send(usuario)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          usuarioNoExiste(usuario, done);
        });
    });

    // test("Un usuario con un username con más de 30 caracteres no debería ser creado", (done) => {
    //   let usuario = {
    //     username: "daniel".repeat(10),
    //     email: "daniel@gmail.com",
    //     password: "contraseña",
    //   };
    //   request(app)
    //     .post("/usuarios")
    //     .send(usuario)
    //     .end((err, res) => {
    //       expect(res.status).toBe(201);
    //       expect(typeof res.text).toBe("string");
    //       usuarioNoExiste(usuario, done);
    //     });
    // }, 10000);

    test("Un usuario cuya contraseña tenga menos de 6 caracteres no debería ser creado", (done) => {
      let usuario = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "abc",
      };
      request(app)
        .post("/usuarios")
        .send(usuario)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          usuarioNoExiste(usuario, done);
        });
    });

    // test("Un usuario cuya contraseña tenga más de 200 caracteres no debería ser creado", (done) => {
    //   let usuario = {
    //     username: "daniel",
    //     email: "daniel@gmail.com",
    //     password: "contraseña".repeat(40),
    //   };
    //   request(app)
    //     .post("/usuarios")
    //     .send(usuario)
    //     .end((err, res) => {
    //       expect(res.status).toBe(201);
    //       expect(typeof res.text).toBe("string");
    //       usuarioNoExiste(usuario, done);
    //     });
    // });

    test("El username y email de un usuario válido deben ser guardados en lowercase", (done) => {
      let usuario = {
        username: "DaNIEL",
        email: "APPdelante@GMAIL.com",
        password: "pruebapruebaprueba",
      };
      request(app)
        .post("/usuarios")
        .send(usuario)
        .end((err, res) => {
          expect(res.status).toBe(201);
          expect(typeof res.text).toBe("string");
          expect(res.text).toEqual("Usuario creado exitósamente.");
          usuarioExisteYAtributosSonCorrectos(
            {
              username: usuario.username.toLowerCase(),
              email: usuario.email.toLowerCase(),
              password: usuario.password,
            },
            done
          );
        });
    });
  });

  describe("POST /login", () => {
    test("Login debería fallar para un request que no tiene username", (done) => {
      let bodyLogin = {
        password: "holaholahola",
      };
      request(app)
        .post("/usuarios/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un request que no tiene password", (done) => {
      let bodyLogin = {
        username: "noexisto",
      };
      request(app)
        .post("/usuarios/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un usuario que no esta registrado", (done) => {
      let bodyLogin = {
        username: "noexisto",
        password: "holaholahola",
      };
      request(app)
        .post("/usuarios/login")
        .send(bodyLogin)
        .end((err, res) => {
          expect(res.status).toBe(400);
          expect(typeof res.text).toBe("string");
          done();
        });
    });

    test("Login debería fallar para un usuario registrado que suministra una contraseña incorrecta", (done) => {
      let usuario = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos",
      };

      new Usuario({
        username: usuario.username,
        email: usuario.email,
        password: bcrypt.hashSync(usuario.password, 10),
      })
        .save()
        .then((nuevoUsuario) => {
          request(app)
            .post("/usuarios/login")
            .send({
              username: usuario.username,
              password: "arrozverde",
            })
            .end((err, res) => {
              expect(res.status).toBe(400);
              expect(typeof res.text).toBe("string");
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("Usuario registrado debería obtener un JWT token al hacer login con credenciales correctas", (done) => {
      let usuario = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos",
      };

      new Usuario({
        username: usuario.username,
        email: usuario.email,
        password: bcrypt.hashSync(usuario.password, 10),
      })
        .save()
        .then((nuevoUsuario) => {
          request(app)
            .post("/usuarios/login")
            .send({
              username: usuario.username,
              password: usuario.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: nuevoUsuario._id }, config.jwt.secreto, {
                  expiresIn: config.jwt.tiempoDeExpiracion,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });

    test("Al hacer login no debe importar la capitalización del username", (done) => {
      let usuario = {
        username: "daniel",
        email: "daniel@gmail.com",
        password: "perrosamarillos",
      };

      new Usuario({
        username: usuario.username,
        email: usuario.email,
        password: bcrypt.hashSync(usuario.password, 10),
      })
        .save()
        .then((nuevoUsuario) => {
          request(app)
            .post("/usuarios/login")
            .send({
              username: "DaNIEL",
              password: usuario.password,
            })
            .end((err, res) => {
              expect(res.status).toBe(200);
              expect(res.body.token).toEqual(
                jwt.sign({ id: nuevoUsuario._id }, config.jwt.secreto, {
                  expiresIn: config.jwt.tiempoDeExpiracion,
                })
              );
              done();
            });
        })
        .catch((err) => {
          done(err);
        });
    });
  });
});
