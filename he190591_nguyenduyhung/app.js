
const express = require('express');

const app = express();

const articleRouter = require('./routes/articleRouter');
const commentRouter = require('./routes/commentRouter');

app.use(express.json());

app.use('/articles', articleRouter);
app.use('/comments', commentRouter);

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});