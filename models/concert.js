const Sequelize = require('sequelize');

module.exports = class Concert extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        title: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        location: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        date: {
          type: Sequelize.DATE,
          allowNull: false,
          unique: false,
        },
        startTime: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        endTime: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        age: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: false,
        },
        now: {
          type: Sequelize.INTEGER,
          allowNull: true,
          unique: false,
          defaultValue: 0,
        },
        max: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: false,
        },
        concertImg: {
          type: Sequelize.STRING(300),
          allowNull: true,
          defaultValue:
            'https://avataaars.io/?avatarStyle=Transparent&topType=NoHair&accessoriesType=Blank&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Black&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Pale',
        },
        seatImg: {
          type: Sequelize.STRING(300),
          allowNull: true,
          defaultValue:
            'https://avataaars.io/?avatarStyle=Transparent&topType=NoHair&accessoriesType=Blank&facialHairType=Blank&clotheType=ShirtCrewNeck&clotheColor=Black&eyeType=Default&eyebrowType=Default&mouthType=Default&skinColor=Pale',
        },
        status: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: true,
        },
        full: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        bossUserId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        seatInfo: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        underscored: false,
        modelName: 'Concert',
        tableName: 'concerts',
        paranoid: true,
        charset: 'utf8',
        collate: 'utf8_general_ci',
      }
    );
  }

  static associate(db) {
    db.Concert.hasMany(db.Ticket);
    db.Concert.belongsToMany(db.User, {
      through: 'user_concert',
      as: 'ConcertUsers',
    });
  }
};
