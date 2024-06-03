const http = require('http');
const soap = require('soap');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 8000;
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
    const wsdlUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.headers.host}/wsdl?wsdl` 
        : `http://localhost:${port}/wsdl?wsdl`;
    console.log(`Creating SOAP client with WSDL URL: ${wsdlUrl}`);
    soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
            console.error('Error creating SOAP client:', err);
            return res.status(500).send(err);
        }
        client.SaveUser(user, (err, result) => {
            if (err) {
                console.error('Error calling SaveUser:', err);
                return res.status(500).send(err);
            }
            res.send(result);
        });
    });
});

app.get('/getUsers', (req, res) => {
    const wsdlUrl = process.env.NODE_ENV === 'production' 
        ? `https://${req.headers.host}/wsdl?wsdl` 
        : `http://localhost:${port}/wsdl?wsdl`;
    console.log(`Obeteniendo a los usuarios: ${wsdlUrl}`);
    soap.createClient(wsdlUrl, (err, client) => {
        if (err) {
            console.error('EError al cargar usuarios:', err);
            return res.status(500).send(err);
        }
        client.GetUsers({}, (err, result) => {
            if (err) {
                console.error('Error calling GetUsers:', err);
                return res.status(500).send(err);
            }
            res.send(result);
        });
    });
});

const server = http.createServer(app);

soap.listen(server, '/wsdl', service, wsdl);

server.listen(port, () => {
    console.log(`Servidor corriendo en el puerto: ${port}`);
});