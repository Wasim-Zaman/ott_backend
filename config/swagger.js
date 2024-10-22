const path = require('path');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'OTT',
    version: '1.0.0',
    description: 'APIs Documentation',
    contact: {
      name: process.env.NAME,
      email: process.env.EMAIL,
    },
  },
  servers: [
    {
      url: process.env.DOMAIN,
      description: 'Production server',
    },
    {
      url: process.env.LOCAL_HOST,
      description: 'Development server',
    },
    // add more hosts...
  ],
};

var options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    path.join(__dirname, '../docs/swagger/admin.js'),
    path.join(__dirname, '../docs/swagger/movie.js'),
    // add more paths...
  ],
};

var swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
