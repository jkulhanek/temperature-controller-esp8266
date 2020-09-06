const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 4000
const app = express()

app.use('/', express.static(path.resolve(__dirname, 'wwwroot')));
app.listen(PORT, function() {
  console.log(`Server is running on: ${PORT}`)
})
