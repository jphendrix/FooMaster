var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        try{
            let args = url.parse(req.url,true).query;
            log('Recived'+ JSON.stringify(args)); 

            var AWS = require("aws-sdk");

            AWS.config.update({
              region: "us-east-1",
              endpoint: "http://localhost:8000"
            });
            
            var docClient = new AWS.DynamoDB.DocumentClient();
            
            var params = {
                TableName:"Log",
                Item:{
                    "LogID": 1,
                    "InsertDate": 1,
                    "info":{"ted":"bob"}
                }
            };
            
            log("Adding a new item...");
            docClient.put(params, function(err, data) {
                if (err) {
                    log("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                } else {
                    log("Added item:", JSON.stringify(data, null, 2));
                }
            });            
        }catch(err){
            log(err);
        }

        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
