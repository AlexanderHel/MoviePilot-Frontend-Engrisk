const path = require('node:path')
const express = require('express')
const proxy = require('express-http-proxy')

const app = express()
const port = process.env.NGINX_PORT || 3000

//  Back end API  Address
const proxyConfig = {
  URL: '127.0.0.1',
  PORT: process.env.PORT || 3001
}

//  Static file service catalog
app.use(express.static(__dirname))

//  Configure the proxy middleware to forward requests to the backendAPI
app.use(
  '/api',
  proxy(`${proxyConfig.URL}:${proxyConfig.PORT}`, {
    //  Path plus /api  Prefix (linguistics)
    proxyReqPathResolver: (req) => {
      return `/api${req.url}`
    }
  })
);


//  Handling of root path requests
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')) //  Point to your front-end entry file
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
