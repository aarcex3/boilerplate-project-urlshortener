require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const crypto = require('crypto');

// Middleware to parse request body
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

// Database to store URL mappings
const urlMapping = {/* e3b0c442:google */ };
// Function to generate a unique hash for the URL
function generateHash(url) {
    const hash = crypto.createHash('md5');
    hash.update(Buffer.from(url));
    return hash.digest('hex').substring(0, 8);
}

function isURL(str) {
    const urlRegex = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.){1,}[a-zA-Z]{2,}(:[0-9]{1,5})?(\/\S*)?$/;
    return urlRegex.test(str);
}


app.post('/api/shorturl', (req, res) => {
    const { url } = req.body;
    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }
    if (!isURL(url)){
        return res.json({ error: 'invalid url' })
    }
    let hash = generateHash(url);
    if (!urlMapping.hasOwnProperty(hash)){
        urlMapping[hash] = url;
        const shortUrl = hash;
        return res.json({
            original_url: url,
            short_url: shortUrl
        }); 
    } else {
        return res.json({
            original_url: urlMapping[hash],
            short_url: hash
        }); 
    }
});

app.get('/api/shorturl/:hash', (req, res) => {
    const { hash } = req.params;
    if (urlMapping.hasOwnProperty(hash)) {
        const original_url = urlMapping[hash]
        return res.redirect(original_url);
    } else {
        return res.status(404).json({ error: 'Short URL not found' });
    }
});

app.listen(port, function() {
    console.log(`Listening on port ${port}`);
});