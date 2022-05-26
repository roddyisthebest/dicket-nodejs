const db = require('./models');
const schedule = require('node-schedule');
const moment = require('moment');

const update = () =>
  schedule.scheduleJob('0 0 0 * * *', async function () {
    try {
      const concerts = await db.Concert.findAll({
        where: {
          status: true,
        },
      });
      concerts.map(async (concert) => {
        const concertDate = moment(concert.date);
        const todayDate = moment();
        const diff = concertDate.diff(todayDate, 'days');
        if (diff === 0) {
          await db.Concert.update(
            { status: false },
            { where: { id: concert.id } }
          );
        }
      });
    } catch (e) {
      console.log(e);
    }
  });

module.exports = update;
