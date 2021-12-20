var port = process.env.PORT || 3000,
    http = require('http'),
    url = require('url'),
    fs = require('fs');

var log = function(entry) {
    let d = new Date();
    d.setHours(d.getHours()-5); //EST
    entry = d.toLocaleDateString() + ' ' + d.toLocaleTimeString()  + ' - ' + entry;
    fs.appendFileSync('/tmp/sample-app.log',  entry + '\n');
    l += "<p>" + entry + "</p>"
};

const server = http.createServer();

server.on('request', async (req,res)=>{
    let response = {action:"none"};
    let args = url.parse(req.url,true).query;

    log("URL Args:" + JSON.stringify(args));

    //if(args.data){
    //    if(typeof args.data === "string"){
    //        args.data = JSON.parse(args.data);
    //    }

        response = await put("{'bob':'ted'}")
    //}

    res.end(JSON.stringify(response));
});

function put(data){
    return new Promise(resolve => {

        try{
            log("Trying the best I can");
            
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
                    "Data":JSON.stringify(data)
                },
                TableName:"Journal"
            };
    
            log("Adding: " + JSON.stringify(item));
            try{
                docClient.put(item,function(err,data){
                    if(err){
                        log("Err putting: " + JSON.stringify(err));
                        resolve({err:JSON.stringify(err)});
                    }else{
                        log("Great Scott!" + JSON.stringify(data));
                        resolve({success:JSON.stringify(data)});
                    }
                });
            }catch(e){
                resolve({e:JSON.stringify(e)});
            }
        }catch(e1){
            resolve({e1:JSON.stringify(e1)});
        }
    });
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);