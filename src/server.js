const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = Number(process.env.APP_PORT || 3000);
const host = process.env.DB_HOST || 'mongo-service';
const database = process.env.DB_NAME || 'practica_db';
const username = encodeURIComponent(process.env.DB_USER || '');
const password = encodeURIComponent(process.env.DB_PASS || '');

const uri = `mongodb://${username}:${password}@${host}:27017/${database}?authSource=admin`;
const client = new MongoClient(uri, { serverSelectionTimeoutMS: 3000 });

app.get('/healthz', (_request, response) => {
  response.json({ status: 'ok', service: 'backend' });
});

app.get('/', async (_request, response) => {
  try {
    await client.db(database).command({ ping: 1 });
    response.json({
      message: 'Backend funcionando y conectado a MongoDB',
      database,
      status: 'ok'
    });
  } catch (error) {
    response.status(503).json({
      message: 'El backend responde, pero no pudo conectarse a MongoDB',
      detail: error.message
    });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend escuchando en el puerto ${port}`);
});
