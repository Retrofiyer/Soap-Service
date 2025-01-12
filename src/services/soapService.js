const soap = require('soap');
const { readData, writeData } = require('../models/userModel');

const createSoapService = () => {
    return {
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
};

module.exports = { createSoapService };