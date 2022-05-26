const Sequelize = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];

const Concert = require('./concert');
const PriceType = require('./priceType');
const Ticket = require('./ticket');
const User = require('./user');

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.Concert = Concert;
db.PriceType = PriceType;
db.Ticket = Ticket;
db.User = User;

Concert.init(sequelize);
PriceType.init(sequelize);
Ticket.init(sequelize);
User.init(sequelize);

Concert.associate(db);
PriceType.associate(db);
Ticket.associate(db);
User.associate(db);

module.exports = db;
