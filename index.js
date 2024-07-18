require('dotenv').config()
const express= require('express');
const mongoose = require('mongoose');
const app=express();
const cors = require('cors');
const PORT=process.env.PORT|8000
const userRoutes=require('./routes/userRoutes')


app.use(express.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URL)

app.use(userRoutes);


app.listen(PORT,()=>console.log(`Server started at port:${PORT}`));