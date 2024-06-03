const http = require('http');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, 'db.json');

const readData = () => {
    if (!fs.existsSync(dbPath)) {
        return { usuarios: [] };
    }
    const data = fs.readFileSync(dbPath, 'utf8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

const service = {
    UserService: {
        UserServiceSoapPort: {
            SaveUser: (args, callback) => {
                const data = readData();
                data.usuarios.push(args);
                writeData(data);
                callback(null, { status: 'success' });
            },
            GetUsers: (args, callback) => {
                const data = readData();
                callback(null, data);
            }
        }
    }
};

const wsdl = fs.readFileSync(path.join(__dirname, 'service.wsdl'), 'utf8');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/saveUser', (req, res) => {
    const user = req.body;
    soap.createClient(`${req.protocol}://${req.get('host')}/wsdl?wsdl`, (err, client) => {
        if (err) return res.status(500).send(err);
        client.SaveUser(user, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

app.get('/getUsers', (req, res) => {
    soap.createClient(`${req.protocol}://${req.get('host')}/wsdl?wsdl`, (err, client) => {
        if (err) return res.status(500).send(err);
        client.GetUsers({}, (err, result) => {
            if (err) return res.status(500).send(err);
            res.send(result);
        });
    });
});

const server = http.createServer(app);

soap.listen(server, '/wsdl', service, wsdl);

server.listen(8000, () => {
    console.log('Servidor corriendo en el puerto:8000');
});