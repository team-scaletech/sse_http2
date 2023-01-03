const spdy = require("spdy")
const express = require('express')
const app = express()
const fs = require('node:fs')
const path = require('node:path')
const { EventHandler } = require('./eventHandler')
const crypto = require('crypto')

const options = {
    key: fs.readFileSync(path.resolve(__dirname, '../localhost-privkey.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../localhost-cert.pem')),
    allowHTTP1: true
}

const events = new EventHandler()

app.get('/', async (_, res) => {
    res.send(new Date())
})

app.get('/handle', (_, res) => {
    res.send(fs.readFileSync(path.resolve(__dirname, './index.html'), 'utf8').toString())
})

app.get('/incoming', (req, res) => {
    events.triggerOutgoingresponse()
    res.send('events reported')
})

app.get('/events', async function(req, res) {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('retry', "1000");
    res.flushHeaders(); // flush the headers to establish SSE with client
    
    const randomUUid = crypto.randomUUID({disableEntropyCache : true})
    console.log("connection id", randomUUid)

    events.outGoingRequest.set(randomUUid, req)
    events.outGoingResponse.set(randomUUid, res)

    events.totalConnections = ++events.totalConnections

    res.write(`data: ${new Date()}\n\n`);
    

    // If client closes connection, stop sending events
    res.on('close', () => {
        console.log('client dropped me');
        events.outGoingRequest.delete(randomUUid)
        events.outGoingResponse.delete(randomUUid)
        events.totalConnections = --events.totalConnections
        console.log(`connection lost for`, randomUUid)
        res.end();
    });
});

const server = spdy.createServer(options, app)

const port = process.env.PORT || 8443

server.listen(port, () => console.log(`sever is listning on https://localhost:${port}`))
