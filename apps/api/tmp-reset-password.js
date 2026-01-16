const bcrypt = require('bcrypt');
const password = 'password123';
const hash = bcrypt.hashSync(password, 10);
console.log(hash);
