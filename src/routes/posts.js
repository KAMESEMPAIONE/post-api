const express = require('express')
const getPosts = require('../controllers/postsController')
const verifyJWT = require('../middleware/verifyJWT')
const router = new express.Router()

router.use(verifyJWT)
router.get('/',getPosts)

module.exports = router