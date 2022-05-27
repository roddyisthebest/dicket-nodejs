const express = require('express');

const dotenv = require('dotenv');
dotenv.config();

const db = require('../models');
const { isLoggedIn } = require('./middlewares');

const router = express.Router();

router.get('/:ticketId', isLoggedIn, async (req, res, next) => {
  const { ticketId } = req.params;
  try {
    const ticket = await db.Ticket.findOne({
      where: { id: ticketId },
      include: [{ model: db.PriceType }],
    });
    if (ticket.UserId === req.user.id) {
      return res.json({
        message: `${ticket.address}의 nft티켓 정보입니다.`,
        payload: ticket,
      });
    } else {
      return res.status(401).json({
        message: `권한이 없습니다.`,
      });
    }
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.post('/', isLoggedIn, async (req, res, next) => {
  const { concertId, ticketId, address } = req;

  try {
    await db.Concert.increment({ now: 1 }, { where: { id: concertId } });

    await db.Ticket.update(
      {
        address,
        UserId: req.user.id,
        sale: false,
      },
      { where: { id: ticketId } }
    );

    const concert = await db.Concert.findOne({ where: { id: concertId } });
    if (concert.max === concert.now) {
      await db.Concert.update({ status: false }, { where: { id: concert.id } });
    }
    res.json({ message: '티켓 구매가 완료되었습니다.' });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
