var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs');

var log = function(entry) {
    let d = new Date();
    d.setHours(d.getHours()-5); //EST
    entry = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()  + ' - ' + entry;
    fs.appendFileSync('/tmp/foomaster.log',  entry + '\n');
};

const server = http.createServer();

server.on('request', async (req,res)=>{
    let args = url.parse(req.url,true).query;

    if(args && args.data){
        put(args.data)
            .then((x)=>{
                res.end(JSON.stringify(x||{}));
            })
            .catch((x)=>{
                res.end(JSON.stringify(x||{}));
            });
    }else{
        res.end(JSON.stringify({action:"none"}));
    }
});

function put(d){
    return new Promise(resolve => {
        try{
            var AWS = require("aws-sdk");
            AWS.config.update({
                region:"us-east-1",
                endpoint:"http://dynamodb.us-east-1.amazonaws.com"
            });
    
            var docClient = new AWS.DynamoDB.DocumentClient();
    
            var item = {
                Item:{
                    "InsertDate":new Date()*1,
                    "Source":"Primary",
                    "Data":d
                },TableName:"Journal"
            };

            docClient.put(item,function(err,data){
                if(err){
                    log("Err putting: " + err);
                    resolve({error:err});
                }else{
                    resolve({success:d});
                }
            });
        }catch(err){
            log("got error" + JSON.stringify(err||{}));
            resolve({error:JSON.stringify(err)});
        }
    });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);