const Post = require('../models/postModel');


// @desc Get all posts
// @route GET /posts
// @access Private
const getAllPosts = async (req, res) => {
    const posts = await Post.find().lean()
    if(!posts?.length) return res.status(204).json({message: 'No posts found.'})
    res.json(posts)
}

// @desc Get posts by author
// @route GET /posts/my-posts
// @access Private
const getPostsByAuthor = async (req, res) => {
    const author = req.userId
   
    const posts = await Post.find({author}).lean().exec()
    if(!posts?.length) return res.status(204).json({message: 'No posts found.'})
    res.json(posts)
}

// @desc Get one post
// @route GET /posts/:postId
// @access Private
const getPost = async (req, res) => {
    const postId = req.params.postId
    if(!postId) return res.status(400).json({message: 'Post ID required.'})

    const post = await Post.findOne({postId}).lean().exec()
    if(!post) return res.status(204).json({message: 'Post not found'})

    res.json(post)
}

// @desc Create post
// @route POST /posts
// @access Private
const createPost = async (req, res) => {
    const {title, body} = req.body
    if(!title || !body) return res.status(400).json({message: 'All fields required!'})
    const author = req.userId
    const authorName = req.user

    try {
        await Post.create({
            author,
            authorName,
            title,
            body
        })

        res.status(201).json({message: 'Post created!'})
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// @desc Update post
// @route PATCH /posts/:postId
// @access Private
const updatePost = async (req, res) => {
    const userId = req.userId
    const postId = req.params.postId
    if(!postId) return res.status(400).json({message: 'Post ID required.'})

    const {title, body} = req.body
    if(!title && !body) return res.status(400).json({message: 'Must be a new title or a new body!'})

    const foundPost = await Post.findOne({postId}).exec()
    if(!foundPost) return res.status(204).json({message: 'No posts found'})
    if(foundPost?.author.toString() !== userId.toString()) return res.status(401).json({message: 'You have not access to edit this post!'})

    try {
        if(title) foundPost.title = title
        if(body) foundPost.body = body

        await foundPost.save()
        res.json({ message: 'Success data changed'})
    } catch(err) {
        return res.status(500).json({message: err?.message})
    }
}


// @desc Delete post
// @route DELETE /posts/:postId
// @access Private
const deletePost = async (req, res) => {
    const userId = req.userId
    const roles = req.roles
    const postId = req.params.postId
    
    if(!postId) return res.status(400).json({message: 'Post ID required.'})

    const foundPost = await Post.findOne({postId}).exec()
    if(!foundPost) return res.status(204).json({message: 'No posts found'})

    if(!roles.includes('Admin')) {
        if(foundPost?.author.toString() !== userId.toString()) return res.status(401).json({message: 'You have not access to delete this post!'})
    }

    try {
        await foundPost.deleteOne()
        res.json({message:'Post deleted!'})
    } catch(err) {
        return res.status(500).json({message: err?.message})
    }

}

// @desc Add comment to the post
// @route POST /posts/:postId/comments
// @access Private
const addComment = async (req, res) => {
    const userId = req.userId
    const authorName = req.user

    const postId = req.params.postId
    if(!postId) return res.status(400).json({message: 'Post ID required.'})

    const {body} = req.body
    if(!body) return res.status(400).json({message: 'Comment body are required!'})

    const foundPost = await Post.findOne({postId}).exec()
    if(!foundPost) return res.status(204).json({message: 'No posts found'})

    try {
        foundPost.comments.push({
            author: userId,
            authorName,
            body
        })

        await foundPost.save()
        res.status(201).json({message: 'Comment created!'})
    } catch(err) {
        return res.status(500).json({message: err?.message})
    }
}

// @desc Patch comment 
// @route PATCH /posts/:postId/comments
// @access Private
const updateComment = async (req, res) => {
    const userId = req.userId

    const postId = req.params.postId
    if(!postId) return res.status(400).json({message: 'Post ID required!'})

    const {body, commentId} = req.body
    if(!body || !commentId) return res.status(400).json({message: 'Comment body and commentId are required!'})

    const foundPost = await Post.findOne({postId}).exec()
    if(!foundPost) return res.status(204).json({message: 'No posts found'})

    try {
        const foundComment = foundPost.comments.find(comment => comment._id.toString() === commentId)
        if(!foundComment) return res.status(204).json({message: 'Comment not found!'})
        if(foundComment.author.toString() !== userId) return res.status(401).json({message: 'You have no access to update this comment!'})

        foundComment.body = body
        await foundPost.save()
        res.json({message:'Comment updated!'})
    } catch(err) {
        return res.status(500).json({message: err?.message})
    }
}

// @desc Delete comment 
// @route DELETE /posts/:postId/comments
// @access Private
const deleteComment = async (req, res) => {
    const userId = req.userId
    const roles = req.roles

    const {commentId} = req.body
    if(!commentId) return res.status(400).json('Comment ID required!')

    const postId = req.params.postId
    if(!postId) return res.status(400).json({message: 'Post ID required!'})

    const foundPost = await Post.findOne({postId}).exec()
    if(!foundPost) return res.status(204).json({message: 'No posts found'})

    try {
        const foundComment = foundPost.comments.find(comment => comment._id.toString() === commentId)
        if(!foundComment) return res.status(204).json({message: 'Comment not found!'})

        if(!roles.includes('Admin')) {
            if(foundComment.author.toString() !== userId) return res.status(401).json({message: 'You have no access to delete this comment!'})
        }
        
        foundPost.comments = foundPost.comments.filter(comment => comment._id.toString() !== commentId)
        await foundPost.save()

        res.json({message:'Comment deleted!'})
    } catch(err) {
        return res.status(500).json({message: err?.message})
    }
    
}

module.exports = {
    getAllPosts,
    getPostsByAuthor,
    getPost,
    createPost,
    updatePost,
    deletePost,
    addComment,
    deleteComment,
    updateComment
}