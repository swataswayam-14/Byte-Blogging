import express from "express";
import {string, z} from "zod";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { title } from "process";
const app = express();
const prisma = new PrismaClient();
app.use(express.json());
const signUpBody = z.object({
    email: z.string().email(),
    password:z.string(),
    name:z.string().optional()
})

app.post('/api/v1/signup', async(req,res)=>{
    const {success} = signUpBody.safeParse(req.body)
    if(!success){
        return res.status(411).json({
            msg:'Wrong inputs/ email already taken'
        })
    }
    try {
        
        interface UserData {
            email: string;
            password: string;
            name?: string; 
        }
        
        const userData: UserData = {
            email: req.body.email,
            password: req.body.password
        };
        if (req.body.name) {
            userData.name = req.body.name;
        }
        const user = await prisma.user.create({
            data:userData
        })
        const token = jwt.sign({userId:user.id},'babablacksheephavewool', {expiresIn:'1h'});
        return res.json({
            msg:`User with email: ${user.email} is created.`,
            token:token
        })
    } catch (error) {
        return res.status(500).json({
            msg:'Server Down'
        })
    }
})

const signInBody = z.object({
    email:z.string().email(),
    password:z.string()
})
app.post('/api/v1/signin', async(req,res)=>{
    const {success} = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({
            msg:'Wrong inputs'
        })
    }
    try {
        const user = await prisma.user.findUnique({
            where:{
                email:req.body.email
            }
        })
        if(!user){
            return res.status(411).json({
                msg:'User does not exists'
            })
        }
        const token = jwt.sign({userId:user.id},'babablacksheephavewool', {expiresIn:'1h'});
        return res.json({
            msg:`User with email: ${user.email} is logged in.`,
            token:token
        })
    } catch (error) {
        return res.status(500).json({
            msg:'Server Down'
        })
    }
})




const blogBody = z.object({
    title:z.string(),
    content:z.string()
})
interface DecodedToken {
    userId: string;
    iat: number;
    exp: number;
}
app.post('/blog', async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, 'babablacksheephavewool') as DecodedToken;
        console.log('Decoded token:', decoded);
        const {success} = blogBody.safeParse(req.body);
        if(!success){
            return res.status(411).json({
                msg:'Wrong inputs'
            })
        }
        const post = await prisma.post.create({
            data:{
                title:req.body.title,
                content:req.body.content,
                authorId:decoded.userId
            }
        })
        if(!post){
            return res.status(500).json({
                msg: 'Server Down'
            }); 
        } 
        return res.status(200).json({
            msg:`blog post created having the title ${post.title}`
        })
    } catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
})

//route to get a specific blog post
app.get('/blog/:id', async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, 'babablacksheephavewool') as DecodedToken;
        console.log('Decoded token:', decoded);
        const postId = req.params.id;
        const post = await prisma.post.findUnique({
            where:{
                id:postId
            }
        })
        if(!post){
            return res.status(500).json({
                msg: 'Server Down'
            }); 
        }
        return res.json({
            title:post.title,
            content:post.content
        })
    } catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
})

//route to get all the post that a user has

app.get('/blogposts', async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, 'babablacksheephavewool') as DecodedToken;
        console.log('Decoded token:', decoded);

        const posts = await prisma.post.findMany({
            where:{
                authorId:decoded.userId
            }
        })
        
        if(!posts){
            return res.status(500).json({
                msg: 'Server Down'
            }); 
        }
        return res.json({
            posts:posts
        })
    } catch (error) {
        return res.status(401).json({
            msg: 'Unauthorized. Invalid token.'
        });
    }
})


//route to update a blog post

app.put('/blogupdate', async(req,res)=>{
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            msg: 'Unauthorized. No token provided.'
        });
    }
    try {
        const decoded = jwt.verify(token, 'babablacksheephavewool') as DecodedToken;
        console.log('Decoded token:', decoded);
        const title:string = req.body.title;
        const content:string = req.body.content;
        const id:string = req.body.id
        const updatedPost = await prisma.post.update({
            where:{
                id:id,
                authorId:decoded.userId
            },
            data:{
                title:title,
                content:content
            }
        })
        return res.json({
            updatedPost
        })
    } catch (error) {
        return res.status(500).json({
            msg: 'Server Down'
        });
    }
})


app.listen(3000,()=>{
    console.log('server is listening on port 3000...');
    
})