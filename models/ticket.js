const Sequelize = require('sequelize');

module.exports = class Ticket extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        tokenId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true,
        },
        seat: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        address: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: false,
        },
        sale: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          unique: false,
          defaultValue: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Ticket',
        tableName: 'tickets',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    db.Ticket.hasOne(db.PriceType);
  }
};
