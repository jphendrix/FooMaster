var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs');

var log = function(entry) {
    let d = new Date();
    d.setHours(d.getHours()-5); //EST
    entry = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()  + ' - ' + entry;
    fs.appendFileSync('/tmp/sample-app.log',  entry + '\n');
};

const server = http.createServer();

server.on('request', async (req,res)=>{
    let args = url.parse(req.url,true).query;
    log("URL Args:" + JSON.stringify(args));

    if(args.data){

        log("Data:" + JSON.stringify(args.data));

        if(typeof args.data === "string"){
            args.data = JSON.parse(args.data);
        }

        log("Putting data:");
        put(args.data)
            .then((x)=>{
                log("putted: " + JSON.stringify(x||{}));
                res.end(JSON.stringify(x||{}));
            })
            .catch((x)=>{
                log("Failed putted: " + JSON.stringify(x||{}));
                res.end(JSON.stringify(x||{}));
            });
    }else{
        log("No Data");
        res.end(JSON.stringify({action:"none"}));
    }
});

function put(d){
    log("Putting d:" + JSON.stringify(d||{}));
    return new Promise(resolve => {
        log("In Promise");
        try{
            log("creating sdk");
            var AWS = require("aws-sdk");
            AWS.config.update({
                region:"us-east-1",
                endpoint:"http://dynamodb.us-east-1.amazonaws.com"
            });
    
            log("creating doc");
            var docClient = new AWS.DynamoDB.DocumentClient();
    
            log("creating item")
            var item = {
                Item:{
                    "InsertDate":new Date()*1,
                    "Source":"Primary",
                    "Data":JSON.stringify(d)
                },TableName:"Journal"
            };
    
            log("Adding: " + JSON.stringify(item||{}));

            docClient.put(item,function(err,data){
                if(err){
                    log("Err putting: " + JSON.stringify(err));
                    resolve({error:JSON.stringify(err)});
                }else{
                    log("Great Scott!" + JSON.stringify(data));
                    resolve({success:JSON.stringify(data)});
                }
            });

            log("sent item");
        }catch(err){
            log("got error" + JSON.stringify(err||{}));
            resolve({error:JSON.stringify(err)});
        }
    });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);