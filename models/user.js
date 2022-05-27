const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.STRING(30),
          allowNull: false,
          unique: false,
        },
        password: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        address: {
          type: Sequelize.STRING(200),
          allowNull: true,
          unique: true,
        },
        img: {
          type: Sequelize.STRING(300),
          allowNull: true,
          defaultValue:
            'https://avataaars.io/?avatarStyle=Transparent&topType=NoHair&accessoriesType=Blank&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Black&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Pale',
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'User',
        tableName: 'users',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.Ticket);
    db.User.belongsToMany(db.Concert, {
      through: 'user_concert',
      as: 'UserConcerts',
    });
  }
};
