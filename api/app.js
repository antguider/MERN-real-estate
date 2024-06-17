import express from 'express';

const app = new express();

console.log("te4st")

app.use('/api/test', (req, res) => {
    res.send("API called");
});

app.listen(8800, ()=> {
    console.log("Server listening")
});