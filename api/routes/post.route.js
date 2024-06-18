import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => {
    // res.send('Post router')
    console.log("Router test");
});


export default router;