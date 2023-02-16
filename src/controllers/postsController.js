const Post = require('../models/postModel');

const getPosts = (req, res) => {
    console.log(req.user, req.roles, req.userId)
    res.send([1,2,3])
}

module.exports = getPosts