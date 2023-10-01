const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const app = express();
dotenv.config();

const connectDb = () => {
    mongoose
        .connect(
            process.env.MONGO_URL)
        .then(() => {
            console.log("MONGODB CONNECTED");
        })
        .catch((err) => {
            console.log("Mongodb error : ", err);
        });
};

app.listen(process.env.PORT, async () => {
    connectDb();
    console.log(`Server started listening at port ${process.env.PORT}`)
})