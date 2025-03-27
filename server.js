const express = require('express');
const mongoose = require ('mongoose');
const cors = require('cors')
const passport = require('passport')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const errorHandler = require('./middleware/errorHandler')





const app = express()


// middleware
app.use(cors({
    origin: '*'
}));
app.use(express.json());
app.use(passport.initialize())
app.use(express.urlencoded({extended: false}))




// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

app.get('/', (req, res) => res.json({ message: 'Auth API is Live!' }));

app.use(errorHandler);




process.env.MONGODB_URI;
const PORT = process.env.PORT || 4000;


mongoose.connect(process.env.MONGODB_URI)
.then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
        console.log(`Node API is running on port ${PORT}`)
    });
}).catch((error) => {
    console.error('MongoDB Connection Error:', error.message);
})
