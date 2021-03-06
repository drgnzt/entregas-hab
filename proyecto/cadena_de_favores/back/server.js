require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const cors = require('cors');

const favourExists = require("./middlewares/favourExists");
const isUser = require("./middlewares/isUser");
const isAdmin = require("./middlewares/isAdmin");

const listFavours = require("./controllers/favours/listFavours");
const listFavoursFind = require("./controllers/favours/listFavoursFind");
const listFavoursAsker = require("./controllers/favours/listFavoursAsker");
const listFavoursMaker = require("./controllers/favours/listFavoursMaker");
const getFavour = require("./controllers/favours/getFavour");
const editFavour = require("./controllers/favours/editFavour");
const asignFavour = require("./controllers/favours/asignFavour");
const voteFavour = require("./controllers/favours/voteFavour");
const newFavour = require("./controllers/favours/newFavour");
const deleteFavour = require("./controllers/favours/deleteFavour");

// User controllers
const newUser = require("./controllers/users/newUser");
const validateUser = require("./controllers/users/validateUser");
const loginUser = require("./controllers/users/loginUser");
const listUsers = require("./controllers/users/listUsers");
const getUser = require("./controllers/users/getUser");
const editUser = require("./controllers/users/editUser");
const deleteUser = require("./controllers/users/deleteUser");
const editUserPassword = require("./controllers/users/editUserPassword");
const recoverUserPassword = require("./controllers/users/recoverUserPassword");
const resetUserPassword = require("./controllers/users/resetUserPassword");

const { checkData } = require('./helpers');

const app = express();

// Middlewares iniciales

// Log de peticiones a la consola
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Procesado de body tipo json
app.use(bodyParser.json());

// Procesado de body tipo form-data
app.use(fileUpload());

// Intercambio de origen cruzado para habilitar solicitudes de HTTP
app.use(cors());


// 
app.use(express.static("static"));

/*
  ENDPOINTS DE FAVORES
*/

// Listar multiples entradas de favores
// GET - /favours ✅
// Público
app.get("/favours", listFavours);

// Listar multiples entradas de favores
// GET - /favours ✅
// Público
app.get("/favours/:id", getFavour);

// Listar multiples entradas de favores
// POST - /favours ✅
// Público
app.post("/favours/find", listFavoursFind);

// Listar los favores de usuario pedichón
// GET - /favours/:id ✅
// Público
app.get("/favours/asker/:id", listFavoursAsker);

// Listar los favores de usuario héroe
// GET - /favours/:id ✅
// Público
app.get("/favours/maker/:id", listFavoursMaker);

// Aceptar un favor
// POST - /favours/:id ✅
// Sólo usuarios registrados
app.post("/favours/:id", isUser, asignFavour);

// Editar un favor
// PUT - /favours/:id ✅
// Sólo el usuario que lo ha subido o admin
app.put("/favours/:id", isUser, favourExists, editFavour);

// Votar un favor asker o maker
// POST - /favours/:id/votes ✅
// Sólo usuarios registrados
app.post("/favours/:id/votes", isUser, favourExists, voteFavour);

// Crear un nuevo favor
// POST - /favours ✅
// Sólo usuarios registrados
app.post("/favours", isUser, newFavour);

// Borrar una entrada del favor
// DELETE - /entries/:id ✅
// Sólo usuario que creara esta favor o admin
app.delete("/favours/:id", isUser, favourExists, deleteFavour);

/*
  ENDPOINTS DE USUARIO
*/

// Registro de usuarios
// POST - /users ✅
// Público
app.post("/users", newUser);

// Validación de usuarios registrados
// GET - /users/validate/:code ✅
// Público
app.get("/users/validate/:code", validateUser);

// Login de usuarios
// POST - /users/login ✅
// Público
app.post("/users/login", loginUser);

// Ver listado de usuarios
// GET - /users
// Para todos los usuarios
app.get("/users", listUsers);

// Ver información de un usuario
// GET - /users/:id ✅
// Sólo para usuarios registrados
// Pero si el usuario es el mismo o admin debería mostrar toda la información
app.get("/users/:id", isUser, getUser);

// Editar datos de usuario: email, name, avatar
// PUT - /users/:id ✅
// Sólo el propio usuario o el usuario admin
app.put("/users/:id", isUser, editUser);

// Borrar un usuario
// DELETE- /users/:id ✅
// Sólo el usuario admin
app.delete("/users/:id", isUser, isAdmin, deleteUser);

// Editar password de usuario
// POST - /users/:id/password
// Sólo el propio usuario
app.post("/users/:id/password", isUser, editUserPassword);

// Enviar código de reset de password
// POST - /users/recover-password
// Público
app.post("/users/recover-password", recoverUserPassword);

// Resetear password de usuario
// POST - /users/reset-password
// Público
app.post("/users/reset-password", resetUserPassword);


// Comprobamos cada 10000ms si alguna fecha está caducada
// y en tal caso, la cancelamos
setInterval(() => {
  checkData();
}, 10000);
// Lanzamos la comprobación la primera vez
checkData();

// Middlewares finales

// Error middleware
app.use((error, req, res, next) => {
  console.error(error);

  res.status(error.httpStatus || 500).send({
    status: "error",
    message: error.message,
  });
});

// Not found
app.use((req, res) => {
  res.status(404).send({
    status: "error",
    message: "Not found",
  });
});

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`API funcionando en http://localhost:${port} 🙈`);
});
