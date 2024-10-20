const http = require('http');
const fs = require('fs').promises;
const path = require('path');
const { Command } = require('commander');
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

// Створюємо HTTP сервер
const server = http.createServer(async (req, res) => {
  const urlPath = req.url;

  // Перевіряємо метод запиту
  if (req.method === 'GET' && urlPath.startsWith('/')) {
    const code = urlPath.slice(1); // Витягуємо код з URL (наприклад, "200" з "/200")
    const filePath = path.join(cache, `${code}.jpg`); // Формуємо шлях до файлу
    const notFoundImagePath = path.join(cache, '404.jpg');
   
    try {
        const image = await fs.readFile(filePath);
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(image);
    } catch (error) {
      // Якщо файл не знайдено, повертаємо 404
      /*res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end(`404 File not found for HTTP code: ${code}`);*/
      const notFoundImage = await fs.readFile(notFoundImagePath);
      res.writeHead(404, { 'Content-Type': 'image/jpeg' });
      res.end(notFoundImage);
    }
  } else {
    // Якщо метод не GET, повертаємо 405 Method Not Allowed
    res.writeHead(405, { 'Content-Type': 'text/plain' });
    res.end('405 Method not allowed');
  }
});

// Запускаємо сервер на заданому хості та порту
server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});

