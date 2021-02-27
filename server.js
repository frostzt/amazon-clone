const dotenv = require('dotenv');
const mongoose = require('mongoose');
const http = require('http');
const socketio = require('socket.io');

dotenv.config({ path: './config.env' });

const port = process.env.PORT;
const app = require('./app');

// SETUP SOCKET SERVER
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: '*',
  },
});

// CONNECT TO THE DATABASE
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('connected to DB'));

// SETUP SOCKET CONNECTIONS
io.on('connection', (socket) => {
  console.log('New WS connection established');

  io.on('disconnect', () => {
    console.log('User has left...');
  });
});

// START THE SERVER
server.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
