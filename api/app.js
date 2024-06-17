import express from 'express';

const app = new express();

console.log("te4st")

app.listen(8800, ()=> {
    console.log("Server listening")
});