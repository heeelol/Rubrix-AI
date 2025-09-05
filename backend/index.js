const express = require('express');
const app = express();
const { createServer } = require('node:http');
const port = 3000;

const server = createServer(app);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})