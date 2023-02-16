require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const path = require('path')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/connectDB')
const {logger} = require('./middleware/logger')

const app = express();
const PORT = process.env.PORT || 8080

connectDB()

app.use(logger)
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use( express.static(path.join(__dirname, 'public')))

app.use('/', require('./routes/root'))
app.use('/register', require('./routes/register'))
app.use('/auth', require('./routes/auth'))

//private routes
app.use('/posts', require('./routes/posts'))

app.all('*', (req, res) => {
    res.status(404).send('404 Not Found')
})

app.use((err, req, res, next) => {
    res.status(500).json({message: err?.message})
})

mongoose.connection.once('open', () => {
    console.log('Connected to MondoDB!')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}!`))
})

mongoose.connection.on('error', (err) => {
    console.error(err)
})