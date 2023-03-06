const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    authorName: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 96
    },

    body: {
        type: String,
        required: true,
        minLength: 12,
        maxLength: 16256
    },

    comments: {
        type: [{
            author: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },

            authorName: {
                type: String,
                required: true
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
