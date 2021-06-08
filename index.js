const express = require("express");
const cors = require("cors");
require('dotenv').config();
const ObjectId = require('mongodb').ObjectId;
const MongoUtil= require('./MongoUtil');
MongoUtil.connect(process.env.MONGO_URL, 'workout')