
const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
const superagent = require('superagent');
const program = new Command();

// Налаштовуємо команду з параметрами
program
  .requiredOption('-h, --host <host>', 'Server host address')
  .requiredOption('-p, --port <port>', 'Server port')
  .requiredOption('-c, --cache <cachePath>', 'Cache directory path');

// Перевіряємо наявність параметрів вручну перед парсингом
const args = process.argv.slice(2);
if (!args.includes('-h') && !args.includes('--host') ||
    !args.includes('-p') && !args.includes('--port') ||
    !args.includes('-c') && !args.includes('--cache')) {
  console.log('please write parameter');
  process.exit(1); // Завершуємо процес з помилкою
}

// Парсимо аргументи за допомогою commander
program.parse(process.argv);

// Отримуємо параметри з командного рядка
const { host, port, cache } = program.opts();

// Виводимо отримані параметри
console.log(`Starting server at http://${host}:${port}`);
console.log(`Cache directory: ${cache}`);

// Допоміжна функція для надсилання відповіді
const sendResponse = (res, statusCode, contentType, message) => {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(message);
};

// Створюємо HTTP сервер
const server = http.createServer(async (req, res) => {
  const urlPath = req.url;
  const code = urlPath.slice(1); // Витягуємо код з URL
  const filePath = path.join(cache, `${code}.jpg`); // Формуємо шлях до файлу

  switch (req.method) {
    case 'GET':
        try {
            const image = await fs.readFile(filePath);
            sendResponse(res, 200, 'image/jpeg', image);
          } catch (error) {
            // Якщо файл не знайдено, просто повертаємо 404
            sendResponse(res, 404, 'text/plain', '404 Not Found');
          }
      break;

    case 'PUT':
      try {
        await fs.access(filePath);
        sendResponse(res, 200, 'text/plain', 'Image already exists in cache');
      } catch (error) {
        // Якщо файл не існує, отримуємо зображення з http.cat
        try {
          const response = await superagent.get(`https://http.cat/${code}`);
          const imageBuffer = response.body; // Отримуємо зображення
          await fs.writeFile(filePath, imageBuffer); // Зберігаємо зображення у кеш
          sendResponse(res, 201, 'text/plain', 'Image saved successfully');
        } catch (error) {
          sendResponse(res, 404, 'text/plain', '404 Not Found');
        }
      }
      break;

    case 'DELETE':
      try {
        await fs.unlink(filePath); // Видаляємо файл з кешу
        sendResponse(res, 200, 'text/plain', 'Image deleted successfully');
      } catch (error) {
        sendResponse(res, 404, 'text/plain', '404 File not found');
      }
      break;

    default:
      sendResponse(res, 405, 'text/plain', '405 Method Not Allowed');
      break;
  }
});

// Запускаємо сервер на заданому хості та порту
server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});
