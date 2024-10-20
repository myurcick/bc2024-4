const http = require('http');
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
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('My first server\n');
});

// Запускаємо сервер на заданому хості та порту
server.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
});

