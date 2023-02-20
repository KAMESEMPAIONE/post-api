const express = require('express')
const postsController = require('../controllers/postsController')
const verifyJWT = require('../middleware/verifyJWT')
const verifyRoles = require('../middleware/verifyRoles')

const router = new express.Router()

router.use(verifyJWT)

router.route('/')
    .get(postsController.getAllPosts)
    .post(verifyRoles('Editor'), postsController.createPost)
    
router.route('/my-posts')
    .get(verifyRoles('Editor'), postsController.getPostsByAuthor)

router.route('/:postId')
    .get(postsController.getPost)
    .patch(verifyRoles('Editor'), postsController.updatePost)
    .delete(verifyRoles('Editor', 'Admin'), postsController.deletePost)

router.route('/:postId/comments')
    .post(postsController.addComment)
    .patch(postsController.updateComment)
    .delete(postsController.deleteComment)


module.exports = router