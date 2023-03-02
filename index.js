const TelegramApi = require('node-telegram-bot-api')
const fs = require('fs')
const YandexTokenStrategy = require('passport-yandex-token');
const passport = require('passport');

// const Client = require('node-torrent');
// const { info } = require('ya-disk');
// const client = new Client({logLevel: 'TRACE',
// downloadPath:'./uploads'
// });
const torrentStream = require('torrent-stream');



// const WebTorrent = require('webtorrent')

// const client = new WebTorrent()


const token = '6124645230:AAFcKrW5qXvcOOXK1ljc0GMrtTtwD3yWBAI'
const login = 'lebedencko.k'
const password = '14Eh1LQL'
const API_TOKEN = 'y0_AgAAAAAGo3exAAkkQwAAAADcSoOBXi1f4aroR12UpQG3_vZPr6P7C1A'
const YANDEX_CLIENT_ID = '2756f6ea939d4010afbb3e85eb1e9b89'
const YANDEX_CLIENT_SECRET = '0b68bd85ac9649049c2795ac79791099'

// passport.use(new YandexTokenStrategy({
//   clientID: YANDEX_CLIENT_ID,
//   clientSecret: YANDEX_CLIENT_SECRET,
//   passReqToCallback: true
// }, function(req, accessToken, refreshToken, profile, next) {
// console.log(`profile = `, profile)

// }));


const bot = new TelegramApi(token, {polling: true})
// const disk = new YandexDisk(login, password)
bot.on('message', async msg => {
  console.log(`msg = `, msg.text)
  // const torrent = client.addTorrent(msg.text);
  // passport.authenticate('yandex-token', (user) => {
  //   console.log('user', user)
  // })

//   try {

//   const { total_space, used_space } = await info(API_TOKEN);

//   console.log(`
// Total space: ${Math.round(total_space / 1000000000)}GB
// Free space: ${Math.round((total_space - used_space) / 1000000)}MB
// `);
// } catch (error) {
//   console.error(error);
// }
// console.log('torrent', torrent)
  // torrent.on('complete', function() {
  //   console.log('props!');

  //   torrent.files.forEach(function(file) {
  //     console.log(`file = `, file)
  //       var newPath = './uploads/' + file.path;
  //       fs.rename(file.path, newPath);
  //       // while still seeding need to make sure file.path points to the right place
  //       file.path = newPath;
  //   });
  // });
  const engine = torrentStream(msg.text);

engine.on('idle', function() {
  // создать uploads, если нет
  const dir = `./uploads/${engine.torrent.name}`
  if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
	engine.files.forEach(function(file) {
		// stream is readable stream to containing the file content
    const stream = file.createReadStream();
    stream.pipe(fs.createWriteStream(`${dir}/${file.name}`));
	});
});

  // client.add(msg.text, torrent => {
  //   // Got torrent metadata!
  //   console.log('Client is downloading:', torrent.infoHash)

  //   for (const file of torrent.files) {
  //     console.log(`file = `, file)
  //     // document.body.append(file.name)
  //   }
  // })
})