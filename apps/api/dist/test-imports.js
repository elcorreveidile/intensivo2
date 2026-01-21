"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
console.log('1. Starting...');
const express_1 = __importDefault(require("express"));
console.log('2. Express imported');
const cors_1 = __importDefault(require("cors"));
console.log('3. CORS imported');
const helmet_1 = __importDefault(require("helmet"));
console.log('4. Helmet imported');
const dotenv_1 = __importDefault(require("dotenv"));
console.log('5. Dotenv imported');
dotenv_1.default.config();
console.log('6. Dotenv config loaded');
const app = (0, express_1.default)();
console.log('7. Express app created');
app.use((0, helmet_1.default)());
console.log('8. Helmet middleware added');
app.use((0, cors_1.default)());
console.log('9. CORS middleware added');
app.use(express_1.default.json());
console.log('10. Express JSON middleware added');
app.listen(4000, () => {
    console.log('11. Server is listening on port 4000!');
});
console.log('Code reached end of file');
//# sourceMappingURL=test-imports.js.map