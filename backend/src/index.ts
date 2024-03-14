import express from "express";
import {z} from "zod";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
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


app.listen(3000,()=>{
    console.log('working');
    
})