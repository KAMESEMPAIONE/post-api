const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    title: {
        type: String,
        required: true
    },

    body: {
        type: String,
        required: true
    },

    comments: {
        type: [{
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },

            body: String,

            date: {
                type: Date,
                default: Date.now
            }
        }],
        default : []
    }
}, {timestamps: true})

PostSchema.plugin(AutoIncrement, {
    inc_field: 'postId',
    id: 'postId'
})


module.exports = mongoose.model('Post', PostSchema)
