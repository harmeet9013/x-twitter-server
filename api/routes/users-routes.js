import { Router } from "express";
import {
    checkUsername,
    createUser,
    loginUser,
    tokenVerify,
} from "../controllers/users-controllers.js";

const usersRoutes = Router();

usersRoutes.post("/login", loginUser);
usersRoutes.post("/tokenverify", tokenVerify);
usersRoutes.post("/checkusername", checkUsername);
usersRoutes.post("/signup", createUser);

export default usersRoutes;
