const express = require('express');
const multer = require('multer');
const path = require('path');

const dotenv = require('dotenv');
dotenv.config();

const db = require('../models');
const { isLoggedIn } = require('./middlewares');

const { Op } = require('sequelize');

const router = express.Router();

const upload_concert = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `uploads/concert_img`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const upload_seat = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, `uploads/seat_img`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post(
  '/concert_img',
  isLoggedIn,
  upload_concert.single('img'),
  (req, res) => {
    res.json({
      code: 200,
      payload: `/img/concert-img/${req.file.filename}`,
    });
  }
);

router.post('/seat_img', isLoggedIn, upload_seat.single('img'), (req, res) => {
  res.json({
    code: 200,
    payload: `/img/seat_img/${req.file.filename}`,
  });
});

router.post('/', isLoggedIn, async (req, res, next) => {
  const {
    title,
    location,
    date,
    startTime,
    endTime,
    age,
    max,
    concertImg,
    seatImg,
    seatInfo,
    tokenIds,
  } = req.body;

  try {
    const seatInfomation = JSON.parse(seatInfo);
    const tokens = JSON.parse(tokenIds);

    var seatInfoString = '';

    seatInfomation.map((e) => {
      seatInfoString += `${e.type}열 - ${e.price}원 \n`;
    });

    const newConcert = await db.Concert.create({
      title,
      location,
      date,
      startTime,
      endTime,
      age,
      max,
      concertImg,
      seatImg,
      bossUserId: req.user.id,
      seatInfo: seatInfoString,
    });
    const user = await db.User.findOne({ where: { id: req.user.id } });
    await user.addUserConcert(parseInt(newConcert.id, 10));

    seatInfomation.map(async (e) => {
      for (let i = 0; i < e.max; i++) {
        const ticket = await db.Ticket.create({
          tokenId: tokens.shift(),
          seat: i,
          address: req.user.address,
          ConcertId: newConcert.id,
          UserId: req.user.id,
        });
        await db.PriceType.create({
          type: e.type,
          price: e.price,
          TicketId: ticket.id,
        });
      }
    });

    return res.json({ code: 200, message: '등록이 완료되었습니다.' });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.put('/', isLoggedIn, async (req, res, next) => {
  const { title, location, date, startTime, endTime, age, concertImg, id } =
    req.body;
  try {
    var isItConstrainter = false;
    const user = await db.User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: db.Concert,
          attributes: ['id'],
          as: 'UserConcerts',
          through: { attributes: [] },
        },
      ],
    });

    user.UserConcerts.map((e) => {
      if (e.id === parseInt(id, 10)) {
        isItConstrainter = true;
      }
    });

    if (!isItConstrainter) {
      return res.status(401).json({ message: '권한이 없습니다.' });
    }

    await db.Concert.update(
      { title, location, date, startTime, endTime, age, concertImg },
      { where: { id } }
    );

    return res.json({ message: '수정이 성공적으로 수행되었습니다.' });
  } catch (e) {
    console.log(e);
  }
});

router.get('/list/:preview', isLoggedIn, async (req, res, next) => {
  const { preview } = req.params;
  try {
    let concerts;
    if (preview === 'true') {
      concerts = await db.Concert.findAll({
        limit: 6,
        where: {
          status: { [Op.not]: false },
        },
      });
    } else {
      concerts = await db.Concert.findAll({
        where: {
          status: { [Op.not]: false },
        },
      });
    }
    return res.json({
      message: '예약 가능한 콘서트 리스트들입니다.',
      payload: concerts,
    });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

router.get('/:id', isLoggedIn, async (req, res, next) => {
  const { id } = req.params;
  try {
    const concert = await db.Concert.findOne({
      where: { id: parseInt(id, 10) },
      include: [
        {
          model: db.Ticket,
          include: [{ model: db.PriceType }],
        },
        {
          model: db.User,
          as: 'ConcertUsers',
          through: { attributes: [] },
        },
      ],
    });
    return res.json({ message: '콘서트 정보입니다.', payload: concert });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
