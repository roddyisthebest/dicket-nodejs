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
  const { concertId, ticketId } = req.body;

  try {
    const ticket = await db.Ticket.findOne({ where: { id: ticketId } });

    if (ticket.UserId === req.user.id) {
      return res
        .status(403)
        .json({ message: '이미 티켓의 주인입니다. 거래 불가능합니다.' });
    }

    if (!ticket.sale) {
      return res
        .status(403)
        .json({ message: '이미 판매된 티켓입니다. 거래 불가능 합니다.' });
    }

    await db.Concert.increment(
      { now: 1 },
      { where: { id: parseInt(concertId, 10) } }
    );

    await db.Ticket.update(
      {
        address: req.user.address,
        UserId: req.user.id,
        sale: false,
      },
      { where: { id: parseInt(ticketId, 10) } }
    );

    const concert = await db.Concert.findOne({ where: { id: concertId } });
    concert.addConcertUser(parseInt(req.user.id, 10));
    if (concert.max === concert.now) {
      await db.Concert.update({ full: true }, { where: { id: concert.id } });
    }
    res.json({ message: '티켓 구매가 완료되었습니다.' });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.delete('/:id', isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const ticket = await db.Ticket.findOne({ where: { id: parseInt(id, 10) } });
    const concert = await db.Concert.findOne({
      where: { id: ticket.ConcertId },
    });
    const bossUser = await db.User.findOne({
      where: { id: concert.bossUserId },
    });

    if (!concert.status) {
      return res
        .status(400)
        .json({ message: '이미 종료된 콘서트입니다. 환불이 불가능합니다.' });
    }

    if (ticket.UserId !== req.user.id) {
      return res
        .status(401)
        .json({ message: '티켓의 주인이 아닙니다. 권한이 없습니다' });
    }

    await db.Concert.decrement(
      { now: 1 },
      { where: { id: parseInt(concert.id, 10) } }
    );

    await db.Ticket.update(
      {
        address: bossUser.address,
        UserId: bossUser.id,
        sale: true,
      },
      { where: { id: parseInt(ticket.id, 10) } }
    );
    const newConcert = await db.Concert.findOne({
      where: { id: ticket.ConcertId },
    });
    newConcert.removeConcertUser(parseInt(req.user.id, 10));
    if (newConcert.max > newConcert.now) {
      await db.Concert.update({ full: false }, { where: { id: concert.id } });
    }
    return res.json({ message: '환불처리 되었습니다.' });
  } catch (e) {
    console.log(e);
    next(e);
  }
});
module.exports = router;
