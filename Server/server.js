const app = require("./app");
const socketHandler= require('./socket')
const http = require("http");
const debug = require("debug")("node-angular");
require('dotenv')

// const server=http.createServer(app,()=>{
//     console.log("app is listening on 3000 port")
// })
const normalizePort = (val) => {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
};

const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
};

const onListening = () => {
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};

const port = normalizePort(process.env.PORT || 3050);
app.set("port", port);

const server = http.createServer(app);

socketHandler(server);

server.on("error", onError);
server.on("listening", onListening);
// console.log(port)
server.listen(port);
