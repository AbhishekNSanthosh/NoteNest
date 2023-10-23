const mongoose = require('mongoose')
const moment = require('moment')

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date, default: new Date(0) },
}, { timestamps: true, versionKey: false });

userSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    const createdAt = moment(ret.createdAt);
    const updatedAt = moment(ret.updatedAt);

    const now = moment();
    const createdAgo = createdAt.from(now);
    const updatedAgo = updatedAt.from(now);

    ret.createdAt = {
      date: createdAt.format('DD/MM/YYYY , HH:mm'),
      ago: createdAgo
    };

    ret.updatedAt = {
      date: updatedAt.format('DD/MM/YYYY , HH:mm'),
      ago: updatedAgo
    };

    return ret;
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;