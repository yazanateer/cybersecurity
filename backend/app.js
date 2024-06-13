const express = require('express');

const app = express(); //starting the express 
const port = 3000; 


app.use(express.json()); //the middleware

app.get('/', (req,res) => {
    res.send("the vulnerable web");
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`);
})

