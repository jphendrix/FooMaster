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

server.on('request', async (req,res)=>{
    const data = await put()
    log(req.url);
    log(data);
    res.end(JSON.stringify(data));
});

function put(){
    return new Promise(resolve => {
        var AWS = require("aws-sdk");
        AWS.config.update({
            region:"us-east-1",
            endpoint:"http://dynamodb.us-east-1.amazonaws.com"
        });

        var docClient = new AWS.DynamoDB.DocumentClient();

        var item = {
            Item:{
                "LogID": 1,
                "InsertDate":1,
                "LogData":"test"
            },
            TableName:"Log"
        };

        log("Adding: " + JSON.stringify(item));
        try{
            docClient.put(item,function(err,data){
                if(err){
                    log("Err putting: " + JSON.stringify(err));
                    resolve({err:JSON.stringify(err)});
                }else{
                    log("Great Scott!" + JSON.stringify(data));
                    resolve({data:JSON.stringify(data)});
                }
            });
        }catch(e){
            resolve({e:JSON.stringify(e)});
        }
    });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);