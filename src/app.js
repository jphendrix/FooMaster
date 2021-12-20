var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs');

    var l = "<h1>hello world</h1>"

var log = function(entry) {
    let d = new Date();
    d.setHours(d.getHours()-5); //EST
    entry = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()  + ' - ' + entry;
    fs.appendFileSync('/tmp/sample-app.log',  entry + '\n');
    l += "<p>" + entry + "</p>"
};

const server = http.createServer();

server.on('request', async (reg,res)=>{
    const data = await put()
    log(req.url);
    log(data);
    res.end(JSON.stringify(data));
});

function put(){
    return new Promise(resolve => {
        setTimeout(()=>{
            resolve({data:1});
        },1000);
    });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);