const express = require ('express');
const app = express();
const port = process.env.PORT || 8083;
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

app.use('/', express.static('dist/app-open-ziti'));

app.listen(port, () => {
    console.log('Server started http://localhost:8083');
});
