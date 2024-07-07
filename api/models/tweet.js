import { Schema, Types, model } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const tweetSchema = new Schema({
    content: { type: String, required: true, minlength: 8, maxlength: 240 },
    authorID: { type: Types.ObjectId, required: true, ref: "User" },
    date: { type: String, required: true },
    media: { type: String, required: true },
    tweets: [{ type: Types.ObjectId, required: true, ref: "User" }],
});

tweetSchema.plugin(mongooseUniqueValidator);

export default model("Tweet", tweetSchema);
