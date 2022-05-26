const { sequelize } = require('./models');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const update = require('./update');
const app = express();

dotenv.config();

sequelize
  .sync({ force: false })
  .then(() => console.log('데이터 베이스 연결 성공했다리요!'))
  .catch((err) => {
    console.log(err);
  });

const passportConfig = require('./passport');
passportConfig();

const userRoutes = require('./routes/user');
const concertRoutes = require('./routes/concert');
const ticketRoutes = require('./routes/ticket');

app.use(morgan('combined'));

app.use(cors());

app.set('port', process.env.PORT || 3000);

app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

const sessionOption = {
  resave: false,
  saveUninitialized: false,
  secret: process.env.COOKIE_SECRET,
  cookie: {
    httpOnly: true,
    secure: false,
  },
};

app.use(session(sessionOption));
app.use(passport.initialize());
app.use(passport.session());

update();
app.get('/', (req, res, next) => {
  res.send('서버호스팅 완료!');
});

app.use('/users', userRoutes);
app.use('/concerts', concertRoutes);
app.use('/tickets', ticketRoutes);

app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== 'prod' ? err : {};
  res.status(err.status || 500);
  res.json({ code: err.status, err });
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기중');
});
