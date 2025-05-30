require('dotenv').config();
const express = require('express');
const path = require('path');
const { query } = require('./utils/db'); // Import the database query function
const app = express();
const port = process.env.PORT || 3000;

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images) from a 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true })); // For parsing form data
app.use(express.json()); // For parsing JSON data

// Route to display all reviews
app.get('/', async (req, res) => {
    try {
        const reviews = await query('SELECT * FROM reviews ORDER BY created_at DESC');
        res.render('index', { title: 'Review Website', reviews });
    } catch (err) {
        console.error('Error fetching reviews:', err);
        res.status(500).send('Error fetching reviews.');
    }
});

// Route to handle adding a new review (POST request)
app.post('/add-review', async (req, res) => {
    const { title, author, rating, comment } = req.body;

    // Basic validation
    if (!title || !author || !rating || !comment) {
        return res.status(400).send('All fields are required.');
    }
    if (rating < 1 || rating > 5) {
        return res.status(400).send('Rating must be between 1 and 5.');
    }

    try {
        const insertQuery = `
            INSERT INTO reviews (title, author, rating, comment)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const newReview = await query(insertQuery, [title, author, parseInt(rating), comment]);
        console.log('New review added:', newReview[0]);
        res.redirect('/'); // Redirect back to the home page to see the new review
    } catch (err) {
        console.error('Error adding review:', err);
        res.status(500).send('Error adding review.');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});