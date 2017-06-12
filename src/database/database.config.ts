import { DATABASE_CONNECTION_CHAIN } from './../config';
import mongoose = require("mongoose");
mongoose.connect(DATABASE_CONNECTION_CHAIN);
export { mongoose };