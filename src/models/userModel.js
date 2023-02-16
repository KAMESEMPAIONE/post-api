const {Schema, model} = require('mongoose')

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 32
    },

    email: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 32
    },

    password: {
        type: String,
        required: true,
    },

    roles: {
        type: [String],
        default: ['User']
    },

    refreshToken: {
        type: [String],
        default: null
    }
})


module.exports = model('User', UserSchema)