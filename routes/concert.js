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
    durationTime,
    age,
    max,
    concertImg,
    seatImg,
    seatInfo,
    tokenIds,
    address,
  } = req;

  try {
    const newConcert = await db.Concert.create({
      title,
      location,
      date,
      startTime,
      durationTime,
      age,
      max,
      concertImg,
      seatImg,
    });
    seatInfo.map(async (e) => {
      const priceType = await db.PriceType.create({
        ConcertId: newConcert.id,
        type: e.type,
        price: e.price,
        max: e.max,
      });
      for (let i = 0; i < e.max; i++) {
        await db.Ticket.create({
          tokenId: tokenIds.shift(),
          PriceTypeId: priceType.id,
          seat: i,
          address,
          ConcertId: newConcert.id,
          UserId: req.user.id,
        });
      }
    });

    return res.json({ code: 200, message: '등록이 완료되었습니다.' });
  } catch (e) {
    console.log(e);
  }
});

router.put('/', isLoggedIn, async (req, res, next) => {
  const {
    title,
    location,
    date,
    startTime,
    durationTime,
    age,
    concertImg,
    id,
  } = req;
  try {
    var isItConstrainter = false;
    const user = await db.User.findOne({
      where: { id: req.user.id },
      include: [{ model: db.Concert, attributes: ['id'] }],
    });

    user.Concert.map((e) => {
      if (e.id === id) {
        isItConstrainter = true;
      }
    });

    if (!isItConstrainter) {
      return res.status(401).json({ message: '권한이 없습니다.' });
    }

    await db.Concert.update(
      { title, location, date, startTime, durationTime, age, concertImg },
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
    if (preview) {
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
    const concert = db.Concert.findOne({
      where: { id },
      include: [{ model: db.User, attributes: ['address', 'userId', 'img'] }],
    });
    return res.json({ message: '콘서트 정보입니다.', payload: concert });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

module.exports = router;
