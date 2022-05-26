const Sequelize = require('sequelize');

module.exports = class PriceType extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        price: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        max: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        now: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'PriceType',
        tableName: 'pricetypes',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    db.PriceType.belongsTo(db.Concert);
    db.PriceType.belongsTo(db.Ticket);
  }
};
