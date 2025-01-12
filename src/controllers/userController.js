const { readData, writeData } = require('../models/userModel');

const getUsers = (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error al leer los usuarios' });
    }
};

const saveUser = (req, res) => {
    try {
        const user = req.body;
        const data = readData();
        data.usuarios.push(user);
        writeData(data);
        res.json({ status: 'success', user });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar el usuario' });
    }
};

module.exports = { getUsers, saveUser };