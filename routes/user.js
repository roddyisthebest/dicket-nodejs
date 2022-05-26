const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');

const dotenv = require('dotenv');
dotenv.config();

const db = require('../models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

const { Op } = require('sequelize');

const router = express.Router();

router.post('/signup', isNotLoggedIn, async (req, res, next) => {
  const { userId, password, address } = req.body;

  try {
    const exUser = await db.User.findOne({
      where: {
        [Op.or]: [{ userId, address }],
      },
    });

    if (exUser) {
      return res.status(403).json({
        code: 403,
        message: '이미 회원가입된 계정입니다.',
      });
    }
    const hash = await bcrypt.hash(password, 12);
    await db.User.create({
      userId,
      password: hash,
      address,
      img: `https://s.gravatar.com/avatar/${md5(userId)}?s=32&d=retro`,
    });

    return res.send({
      code: 200,
      message: '유저가 등록되었습니다.',
    });
  } catch (err) {
    console.log(e);
    return next(e);
  }
});

router.post('/signin', isNotLoggedIn, async (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.log(err);
      return next(err);
    }
    if (info) {
      return res.status(401).send(info.message);
    }
    return req.login(user, async (err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      const fullUser = await db.User.findOne({
        where: { id: user.id },
        attributes: ['id', 'userId', 'img', 'address'],
        include: [
          {
            model: db.Concert,
            attributes: ['id'],
          },
          {
            model: db.Ticket,
            attributes: ['id', 'price'],
          },
        ],
      });
      return res.json(fullUser);
    });
  })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res) => {
  if (req.isAuthenticated()) {
    req.logout();
    req.session.destroy(); // 선택사항
    return res.send({
      code: 200,
      message: '로그아웃 되었습니다.',
    });
  }
});

router.get('/concert/:preview', isLoggedIn, async (req, res, next) => {
  const { preview } = req.params;
  try {
    let user;

    if (preview) {
      user = await db.User.findOne({
        include: [{ model: db.Concert, limit: 5, separate: true }],
        where: {
          id: req.user.id,
        },
      });
    } else {
      user = await db.User.findOne({
        include: [{ model: db.Concert }],
        where: {
          id: req.user.id,
        },
      });
    }

    return res.json({
      message: '유저가 등록한 콘서트 목록입니다.',
      payload: user.Concert,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
