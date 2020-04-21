/* Immuto Web App Template | (c) Immuto, Inc. and other contributors */
const express = require("express");
const path = require("path");
const cluster = require("cluster")


var app = express();
app.use(express.static(path.join(__dirname, "build")));

const DEFAULT_PORT = 8002;

/******************************* Website Pages ********************************/
//app.get('/', (req, res, done) => res.status(201).json({ message: "Hello World!" }));

if (cluster.isMaster) {
    // Count the machine's CPUs
    let cpuCount = require('os').cpus().length;

    // Create a worker for each CPU
    for (let i = 0; i < cpuCount; i += 1) {
        cluster.fork();
    }
  } else {
      const PORT = process.env.PORT || DEFAULT_PORT
      app.listen(PORT, function() {
          console.log(`Worker ${cluster.worker.id} running on port: ${PORT}`)
      });

      app.get("/worker-test", (req, res) => {
          res.end(`Worker ${cluster.worker.id} online!`)
      })

      // Serve react app
      app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'build', 'service-worker.js')));
  }

  // Listen for dying workers
  cluster.on('exit', function (worker) {
    console.error(`Worker ${worker.id} died... restarting`);  
    cluster.fork();
  });