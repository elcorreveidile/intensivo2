console.log('1. Starting...');

import express from 'express';
console.log('2. Express imported');

import cors from 'cors';
console.log('3. CORS imported');

import helmet from 'helmet';
console.log('4. Helmet imported');

import dotenv from 'dotenv';
console.log('5. Dotenv imported');

dotenv.config();
console.log('6. Dotenv config loaded');

const app = express();
console.log('7. Express app created');

app.use(helmet());
console.log('8. Helmet middleware added');

app.use(cors());
console.log('9. CORS middleware added');

app.use(express.json());
console.log('10. Express JSON middleware added');

app.listen(4000, () => {
  console.log('11. Server is listening on port 4000!');
});

console.log('Code reached end of file');
