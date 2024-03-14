"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
const signUpBody = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string(),
    name: zod_1.z.string().optional()
});
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = signUpBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: 'Wrong inputs/ email already taken'
        });
    }
    try {
        const userData = {
            email: req.body.email,
            password: req.body.password
        };
        if (req.body.name) {
            userData.name = req.body.name;
        }
        const user = yield prisma.user.create({
            data: userData
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, 'babablacksheephavewool', { expiresIn: '1h' });
        return res.json({
            msg: `User with email: ${user.email} is created.`,
            token: token
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Server Down'
        });
    }
}));
app.listen(3000, () => {
    console.log('working');
});
