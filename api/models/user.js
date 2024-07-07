import { Schema, Types, model } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const userSchema = new Schema({
    name: { type: String, required: true },
    username: {
        type: String,
        required: true,
        unique: true,
        minlength: 4,
        maxlength: 24,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    avatar: { type: String, required: true },
    tweets: [{ type: Types.ObjectId, required: true, ref: "Tweet" }],
});

userSchema.plugin(mongooseUniqueValidator);

export default model("User", userSchema);
