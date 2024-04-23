const Sequelize = require('sequelize');

const sequelize = new Sequelize('js_man', 'dolpin', '1234', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
