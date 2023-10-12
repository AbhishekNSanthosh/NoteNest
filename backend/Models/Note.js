const mongoose = require('mongoose')
const moment = require('moment')

const NoteSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  desc: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false, });

NoteSchema.set('toJSON', {
  transform: function (doc, ret, options) {
    const createdAt = moment(ret.createdAt);
    const updatedAt = moment(ret.updatedAt);

    const now = moment();
    const createdAgo = createdAt.from(now)
    const updatedAgo = updatedAt.from(now)

    ret.createdAt = {
      date: createdAt.format('DD/MM/YYYY , HH:mm'),
      ago: createdAgo.replace('minutes', 'min').replace('seconds', 'sec')
    };

    ret.updatedAt = {
      date: updatedAt.format('DD/MM/YYYY , HH:mm'),
      ago: updatedAgo.replace('minutes', 'min').replace('seconds', 'sec')
    };

    return ret;
  }
});

const Note = mongoose.model('Note', NoteSchema);

module.exports = Note;