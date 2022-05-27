const express = require('express');
const bcrypt = require('bcrypt');
const passport = require('passport');
const md5 = require('md5');

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
    console.log(err);
    return next(err);
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
      });
      return res.json(fullUser);
    });
  })(req, res, next);
});

router.post('/logout', isLoggedIn, (req, res, next) => {
  try {
    if (req.isAuthenticated()) {
      req.logout();

      req.session.destroy(); // 선택사항
      return res.send({
        code: 200,
        message: '로그아웃 되었습니다.',
      });
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.get('/concerts/:preview', isLoggedIn, async (req, res, next) => {
  const { preview } = req.params;
  try {
    let concerts;
    let message;
    const usersConcert = await db.Concert.findAll({
      where: {
        bossUserId: req.user.id,
      },
    });
    if (preview === 'true') {
      if (usersConcert.length >= 5) {
        concerts = usersConcert.slice(0, 4);
      }
      concerts = usersConcert;
      message = '유저가 등록한 5개이하의 콘서트 목록입니다.';
    } else {
      concerts = usersConcert;
      message = '유저가 등록한 콘서트 목록입니다.';
    }

    return res.json({
      message,
      payload: concerts,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.get('/tickets/:preview', isLoggedIn, async (req, res, next) => {
  const { preview } = req.params;
  try {
    let tickets;
    let message;
    if (preview === 'true') {
      tickets = await db.Ticket.findAll({
        limit: 5,
        where: {
          UserId: req.user.id,
          sale: { [Op.not]: true },
        },
        include: [{ model: db.PriceType }],
      });
      message = '유저가 예매한 5개 이하의 티켓리스트입니다.';
    } else {
      tickets = await db.Ticket.findAll({
        where: {
          UserId: req.user.id,
          sale: { [Op.not]: true },
        },
        include: [{ model: db.PriceType }],
      });
      message = '유저가 예매한 티켓리스트입니다.';
    }

    return res.json({
      message,
      payload: tickets,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
