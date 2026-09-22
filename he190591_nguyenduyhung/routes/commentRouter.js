
const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const router = express.Router();

const DATA_FILE = path.join(__dirname, '../data.json');

const readData = async () => {
    const data = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(data);
};

const writeData = async (data) => {
    await fs.writeFile(
        DATA_FILE,
        JSON.stringify(data, null, 2),
        'utf8'
    );
};

router.get('/', async (req, res) => {
    try {
        const data = await readData();
        res.status(200).json(data.comments);
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await readData();
        const article = data.comments.find(a => a.id === Number(req.params.id));
        if (!article) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        res.status(200).json(article);
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
// Error
router.post('/', async (req, res) => {
    try {
        const { articleId, author, content, date } = req.body;
        if (articleId === undefined || !author || !content || !date) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }
        const data = await readData();
        const article = data.articles.find(
            a => a.id === Number(articleId)
        );
        if (!article) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        const newComment = {
            id: data.comments.length > 0
                ? Math.max(...data.comments.map(c => c.id)) + 1
                : 1,
            articleId: Number(articleId),
            author,
            content,
            date
        };
        data.comments.push(newComment);
        await writeData(data);
        res.status(201).json({
            message: "Create sucessful",
            newComment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.comments.findIndex(
            c => c.id === Number(req.params.id)
        );
        if (index === -1) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        const { articleId, author, content, date } = req.body;
        if (articleId === undefined || !author || !content || !date) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }
        const article = data.comments.find(
            a => a.id === Number(articleId)
        );
        if (!article) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        data.comments[index] = {
            id: data.comments[index].id,
            articleId: Number(articleId),
            author,
            content,
            date
        };
        await writeData(data);
        res.status(200).json({
            message: "Update successful",
            comments : data.comments[index]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.comments.findIndex(
            c => c.id === Number(req.params.id)
        );
        if (index === -1) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        const deletedComment = data.comments.splice(index, 1)[0];
        await writeData(data);
        res.status(200).json({
            message: "Delete successfull",
            article: deletedComment
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
module.exports = router;