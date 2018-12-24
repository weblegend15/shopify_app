const Sequelize = require('sequelize');
const config = require('./config');
const models = require('./models');

const db = {};

console.log('Initializing Sequelize');

// create your instance of sequelize
const sequelize = new Sequelize(
  config.db.name,
  config.db.username,
  config.db.password,
  {
    host: config.db.host,
    dialect: 'mysql',
    storage: config.db.storage
  }
);

// load models
Object.keys(models).forEach(modelName => {
  console.log(`Loading model - ${modelName}`);
  const model = models[modelName](sequelize, Sequelize.DataTypes);
  db[modelName] = model;
});

// invoke associations on each of the models
Object.keys(db).forEach(modelName => {
  if (db[modelName].options.associate) {
    db[modelName].options.associate(db);
  }
});

module.exports = Object.assign({}, db, {
  sequelize,
  Sequelize
});
