const fs = require('fs');
const TelegramApi = require('node-telegram-bot-api')

const { YaDisk } = require('ya-disk-rest-api');
const torrentStream = require('torrent-stream');

const bot = new TelegramApi(process.env.TELEGRAM_BOT_API, { polling: true })
const disk = new YaDisk(process.env.YANDEX_API_TOKEN);

let pathDirectory = ''
const hashDir = {}

const RETRY_COUNT = 3;

const createDir = async (dir) => {
  let count = RETRY_COUNT;
  while (count > 0) {
    try {
      return await disk.createDir(dir);
    } catch (error) {
      console.log('error create dir request', dir)
    }

    count -= 1;
  }

  throw new Error('Too many retries create dir');
}

const uploadFile = async (path, fileToUpload) => {
  let count = RETRY_COUNT;
  while (count > 0) {
    try {
      const file = fileToUpload.createReadStream()
      return await disk.upload({ path, file });
    } catch (error) {
      console.error('error upload file request', error);
    }

    count -= 1;
  }

  throw new Error('Too many retries upload file');
}

const createYaDir = async (files) => {
  const filePathList = files.map(file => file.path)
  for (let filePath of filePathList) {
    let localPath = ''
    const currentFilePath = filePath.split('/').slice(0, -1)
    for (let path of currentFilePath) {
      localPath += `/${path}`
      if (!hashDir[localPath]) {
        hashDir[localPath] = localPath
        await createDir(`${pathDirectory}${localPath}`)
        console.log('path', `${pathDirectory}${localPath}`)
      }
    }
  }
}

// engine.torrent.name
const makeYaDir = async (names) => {

  let dir = path
  // console.log('names', names)
  for (let name of names) {
    if (hashDir[dir]) {
      continue
    }

    dir += `/${name}`
    // setTimeout(async () => {
    try {
      // const isDirExist = await disk.isDirExist(dir)
      // console.log('dir', dir, 'isDirExist', isDirExist)
      console.log('name', name)
      console.log('dir', dir,)
      // if (!isDirExist) {
      // await createDir(dir)
      // }
    } catch (error) {
      // console.log('error makeYaDir', error)
    }
    // }, 1000);
    hashDir[dir] = true
  }
  console.log('hashDir', hashDir)
  return dir
}

const makeLocalDir = (name) => {
  const dir = `./uploads/${name}`
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  return dir
}

const saveLocalFile = (dir, file) => {
  const stream = file.createReadStream();
  stream.pipe(fs.createWriteStream(`${dir}/${file.name}`));
  console.log('file.name', file.name)
}

bot.setMyCommands([
  { command: '/download', description: 'Загрузить файл по magnet ссылки' },
])

bot.onText(/^\/download$/, function (msg) {
  const opts = {
    reply_markup: {
      resize_keyboard: true,
      one_time_keyboard: true,
      keyboard: [
        [{ text: 'Обучение' }, { text: 'Видео' }],
        [{ text: 'Книги' }, { text: 'Программы' }]
      ],
    }
  };

  bot.sendMessage(msg.chat.id, "Прикрепи magnet-ссылку для скачикания", opts);
});

bot.onText(/^Обучение$/, async msg => {
  const chatId = msg.chat.id
  pathDirectory = '/Kirill/learn'
  bot.sendMessage(chatId, 'Вставь magnet-ссылку на файл');
})

bot.onText(/^Видео$/, async msg => {
  const chatId = msg.chat.id
  pathDirectory = '/Kirill/video'
  bot.sendMessage(chatId, 'Вставь magnet-ссылку на файл');
})

bot.onText(/^Книги$/, async msg => {
  const chatId = msg.chat.id
  pathDirectory = '/Kirill/books'
  bot.sendMessage(chatId, 'Вставь magnet-ссылку на файл');
})

bot.onText(/^Программы$/, async msg => {
  const chatId = msg.chat.id
  pathDirectory = '/Kirill/programs'
  bot.sendMessage(chatId, 'Вставь magnet-ссылку на файл');
})

bot.onText(/^magnet/, async msg => {
  const chatId = msg.chat.id

  // if (!path.length) {
  //   bot.sendMessage(msg.chat.id, "Выбери, где будет лежать файл");
  //   return
  // }

  const engine = torrentStream(msg.text);
  engine.on('ready', async function (props) {
    // console.log('engine', engine.torrent.length);
    await createYaDir(engine.files)
    for (const file of engine.files) {
      console.log('start load', file.path)
      await uploadFile(`${pathDirectory}/${file.path}`, file)
      console.log('end load', file.path)
    }
  });
})
