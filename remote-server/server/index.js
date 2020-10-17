const express = require('express');
const app = express();
const basicAuth = require('express-basic-auth');
const proxy = require('express-http-proxy');
const bodyParser = require('body-parser');
const path = require('path');
const btoa = require('btoa');
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', basicAuth({
  challenge: false,
  users: {
    admin: 'topeni'
  }
}));

// Redirect thermometer requests
app.use('/api/device/thermostat', proxy('thermostat.kulhankovi.ml', {
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        proxyReqOpts.headers['Content-Type'] = 'text/html';
        proxyReqOpts.headers["Authorization"] = "Basic " + btoa("admin:topeni");
        return proxyReqOpts;
    },
    https: true,
    proxyReqPathResolver: function (req) {
        return '/api' + req.url;
    }
}));


app.post('/api/login', (req, res) => {
  res.send('valid');
});

if (process.env.NODE_ENV === 'production') {
    // Serve any static files
    app.use(express.static(path.join(__dirname, '../client/build')));
    // Handle React routing, return all requests to React app
    app.get('*', function(req, res) {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
app.listen(port, () => console.log(`Listening on port ${port}`));
