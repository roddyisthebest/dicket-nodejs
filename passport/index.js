const passport = require('passport');
const User = require('../models/user');

const local = require('./localStrategy');

module.exports = () => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const exUser = await User.findOne({ where: { id } });
      done(null, exUser);
    } catch (err) {
      done(err);
    }
  });

  local();
};
