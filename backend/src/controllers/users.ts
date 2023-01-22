import { RequestHandler } from "express";
import createHttpError from "http-errors";
import UserModel from "../models/user";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export const getAuthenticatedUser: RequestHandler = async (req, res, next) => {
    try {
        const user = await UserModel.findById(req.session.userId).select("+email").exec();
        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
};

interface SignUpBody {
    username?: string,
    email?: string,
    password?: string,
}

export const signUp: RequestHandler<unknown, unknown, SignUpBody, unknown> = async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email;
    const passwordRaw = req.body.password;

    try {
        if (!username || !email || !passwordRaw) {
            throw createHttpError(400, "Parametres missing");
        }

        const existingUsername = await UserModel.findOne({ username: username }).exec();

        if (existingUsername) {
            throw createHttpError(409, "Username already taken. Please choose a different one or log in instead.");
        }

        const existingEmail = await UserModel.findOne({ email: email }).exec();

        if (existingEmail) {
            throw createHttpError(409, "A user with this email address already exists. Please log in instead.");
        }

        const passwordHashed = await bcrypt.hash(passwordRaw, 10);

        const newUser = await UserModel.create({
            username: username,
            email: email,
            password: passwordHashed,
        });

        req.session.userId = newUser._id;

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
};

interface LoginBody {
    username?:string,
    password?: string,
}

export const logIn: RequestHandler<unknown,unknown,LoginBody,unknown> = async (req, res, next) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        if (!username || !password){
            throw createHttpError(404,"Parametres missing");
        }
        const user = await UserModel.findOne({username:username}).select("+password +email").exec();
        const status = await UserModel.findOne({username:username,status:"blocked"}).select("+password +email").exec();
        
        if (!user){
            throw createHttpError(401,"Invalid data");
        }
        if (status){
            throw createHttpError(401,"You are blocked");
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
    
        if (!passwordMatch) {
            throw createHttpError(401,"Invalid data");
        }
        req.session.userId = user._id;
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

export const logOut: RequestHandler = (req, res, next) => {
    req.session.destroy(error => {
        if (error) {
            next(error);
        } else {
            res.sendStatus(200);
        }
    });
};

export const getUsers: RequestHandler = async (req, res, next) => {
	try {
		const users = await UserModel.find().exec();
		res.status(200).json(users);
	} catch (error) {
		next(error);
	}
};

export const deleteUser: RequestHandler = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        if (!mongoose.isValidObjectId(userId)){
            throw createHttpError(400,"Invalid user id");
        } 

        const user = await UserModel.findById(userId).exec();

        if (!user){
            throw createHttpError(404,"User not found");
        }
        await user.remove();
        res.sendStatus(204);
        
    } catch (error) {
        next(error)
        
    }
}

interface UpdateUserParams {
    userId:string,
}

interface UpdateUserBody {
    status: string,
}

export const updateUser: RequestHandler<UpdateUserParams, unknown, UpdateUserBody, unknown> = async (req, res, next) => {
    const userId = req.params.userId;
    const newStatus = req.body.status;

    try {
        if (!mongoose.isValidObjectId(userId)){
            throw createHttpError(400,"Invalid note id");
        }
        
        const user = await UserModel.findById(userId).exec();
        if (!user){
            throw createHttpError(404,"Note not found");
        }
        
        user.status = newStatus;

        const updatedUser = await user.save();

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
};
