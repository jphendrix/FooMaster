var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');

    var l = "<h1>hello world</h1>"

let success = true;

var log = function(entry) {
    let d = new Date();
    entry = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()  + ' - ' + entry;
    fs.appendFileSync('/tmp/sample-app.log',  entry + '\n');
    l += "<p>" + entry + "</p>"
};

var server = http.createServer(function (req, res) {
    log("====================== NEW ============================");
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

            log("Getting aws-sdk");
            var AWS = require("aws-sdk");

            log("setting region")
            AWS.config.update({
              region: "us-east-1",
              endpoint: "http://localhost:8000"
            });
            
            log("getting doc")
            var docClient = new AWS.DynamoDB.DocumentClient();
            
            var params = {
                TableName:"Log",
                Item:{
                    "LogID": 1,
                    "InsertDate": 1,
                    "info":{
                        "plot": "Nothing happens at all.",
                        "rating": 0
                    }
                }
            };
            
            log("Adding a new item...");
            docClient.put(params).promis()
                .then(function(data){
                    log("Added item:", JSON.stringify(data, null, 2));
                })
                .catch(function(err){
                    success = false;
                    log("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
                });
            log("After promis")        
        }catch(err){
            success = false;
            log(err);
        }

        log("shutting down")
        res.writeHead(200);
        res.write("<html>" + l + "</html>");
        res.end();
    }
});

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
