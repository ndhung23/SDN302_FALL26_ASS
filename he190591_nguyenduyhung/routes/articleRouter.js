
const express = require('express');
const fs = require('fs/promises');
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
        res.status(200).json(data.articles);
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});

router.get('/:id/comments', async (req, res) => {
    try {
        const data = await readData();
        const articleId = Number(req.params.id);
        const article = data.articles.find(a => a.id === articleId);
        if (!article) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        res.status(200).json(
            data.comments.filter(comment => comment.articleId === articleId)
        );
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const data = await readData();
        const article = data.articles.find(a => a.id === Number(req.params.id));
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

router.post('/', async (req, res) => {
    try {
        const data = await readData();
        const { title, content, author, date } = req.body;
        if (!title || !content || !author || !date) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }
        const newArticle = {
            id: data.articles.length > 0
                ? Math.max(...data.articles.map(a => a.id)) + 1
                : 1,
            title,
            content,
            author,
            date
        };
        data.articles.push(newArticle);
        await writeData(data);
        res.status(201).json({
          message: "Create sucessful",
          newArticle
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
router.put('/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.articles.findIndex(
            a => a.id === Number(req.params.id)
        );
        if (index === -1) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        const { title, content, author, date } = req.body;
        if (!title || !content || !author || !date) {
            return res.status(400).json({
                message: 'Invalid data'
            });
        }
        data.articles[index] = {
            id: data.articles[index].id,
            title,
            content,
            author,
            date
        };
        await writeData(data);
        res.status(200).json({ 
            message: "Update successful",
            article: data.articles[index]
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
router.delete('/:id', async (req, res) => {
    try {
        const data = await readData();
        const index = data.articles.findIndex(
            a => a.id === Number(req.params.id)
        );
        if (index === -1) {
            return res.status(404).json({
                message: 'Resource not found'
            });
        }
        const deletedArticle = data.articles.splice(index, 1)[0];
        data.comments = data.comments.filter(
            c => c.articleId !== deletedArticle.id
        );
        await writeData(data);
        res.status(200).json({
            message: "Delete successfull",
            article: deletedArticle
        });
    } catch (error) {
        res.status(500).json({ message: 'Server/File error' });
    }
});
module.exports = router;