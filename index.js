const express = require("express");
const nedb = require("nedb");
const rest = require("express-nedb-rest");
const cors = require("cors");

const app = express();
const datastore = new nedb({
  filename: "coffeelog.db",
  autoload: true,
});

const restAPI = rest();
restAPI.addDatastore("coffees", datastore);

app.use(cors());
app.use("/", restAPI);

app.listen(3000, '0.0.0.0', () => {
  // '0.0.0.0', to make it available on the network (not only on localhost)
  console.log("API ready at http://localhost:3000");
});
