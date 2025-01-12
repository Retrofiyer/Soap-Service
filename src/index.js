const express = require('express');
const http = require('http');
const soap = require('soap');
const path = require('path');
const userRoutes = require('./routes/userRoutes');
const { createSoapService } = require('./services/soapService');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public/view')));

app.use('/api', userRoutes);

const wsdl = require('fs').readFileSync(path.join(__dirname, 'service.wsdl'), 'utf8');
const server = http.createServer(app);

soap.listen(server, '/wsdl', createSoapService(), wsdl);

server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});