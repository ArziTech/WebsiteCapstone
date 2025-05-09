import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3000;

app.get('/', (req, res) => {
    return res.send("<h1>Hello World</h1>")
})

app.listen(port, () => {
    console.log(`Server running on port: ${port}`)
})