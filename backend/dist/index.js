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
const signInBody = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string()
});
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { success } = signInBody.safeParse(req.body);
    if (!success) {
        return res.status(411).json({
            msg: 'Wrong inputs'
        });
    }
    try {
        const user = yield prisma.user.findUnique({
            where: {
                email: req.body.email
            }
        });
        if (!user) {
            return res.status(411).json({
                msg: 'User does not exists'
            });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, 'babablacksheephavewool', { expiresIn: '1h' });
        return res.json({
            msg: `User with email: ${user.email} is logged in.`,
            token: token
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Server Down'
        });
    }
}));
const blogBody = zod_1.z.object({
    title: zod_1.z.string(),
    content: zod_1.z.string()
});
app.post('/blog', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'babablacksheephavewool');
        console.log('Decoded token:', decoded);
        const { success } = blogBody.safeParse(req.body);
        if (!success) {
            return res.status(411).json({
                msg: 'Wrong inputs'
            });
        }
        const post = yield prisma.post.create({
            data: {
                title: req.body.title,
                content: req.body.content,
                authorId: decoded.userId
            }
        });
        if (!post) {
            return res.status(500).json({
                msg: 'Server Down'
            });
        }
        return res.status(200).json({
            msg: `blog post created having the title ${post.title}`
        });
    }
    catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
}));
//route to get a specific blog post
app.get('/blog/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    const token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'babablacksheephavewool');
        console.log('Decoded token:', decoded);
        const postId = req.params.id;
        const post = yield prisma.post.findUnique({
            where: {
                id: postId
            }
        });
        if (!post) {
            return res.status(500).json({
                msg: 'Server Down'
            });
        }
        return res.json({
            title: post.title,
            content: post.content
        });
    }
    catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
}));
//route to get all the post that a user has
app.get('/blogposts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    const token = (_c = req.headers.authorization) === null || _c === void 0 ? void 0 : _c.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'babablacksheephavewool');
        console.log('Decoded token:', decoded);
        const posts = yield prisma.post.findMany({
            where: {
                authorId: decoded.userId
            }
        });
        if (!posts) {
            return res.status(500).json({
                msg: 'Server Down'
            });
        }
        return res.json({
            posts: posts
        });
    }
    catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
}));
//route to update a blog post
app.put('/blogupdate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    const token = (_d = req.headers.authorization) === null || _d === void 0 ? void 0 : _d.split(' ')[1];
    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'babablacksheephavewool');
        console.log('Decoded token:', decoded);
        const title = req.body.title;
        const content = req.body.content;
        const id = req.body.id;
        const updatedPost = yield prisma.post.update({
            where: {
                id: id,
                authorId: decoded.userId
            },
            data: {
                title: title,
                content: content
            }
        });
        return res.json({
            updatedPost
        });
    }
    catch (error) {
        return res.status(500).json({
            msg: 'Server Down'
        });
    }
}));
app.listen(3000, () => {
    console.log('server is listening on port 3000...');
});
