const http = require('http');
const fs = require('fs');
const index = fs.readFileSync( 'index.html');
const Queue = require('bee-queue');
const backlog = new Queue('SalesForceAPI');
const jsforce = require('jsforce');

const app = http.createServer(function(req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(index);
});

const io = require('socket.io').listen(app);


var jsCon = null;

(async function main () {
    const conn = new jsforce.Connection({
        loginUrl : 'https://intellum--fullsbox.sandbox.my.salesforce.com/'
    });

    const userInfo = await conn.login("cfox@intellum.com.fullsbox", "");
    console.log(userInfo);
    jsCon = conn;
})();


io.on('connection', function(socket) {

    socket.on("upload", (file) => {

        // save the json file to disk for future reference
        //TODO: add in file validation
        fs.writeFile("tmp/temp.json", file, (err) => {
            if (err) throw err;

            //let the front end know we have recieved the file and are parsing it
            socket.emit('fromServer', { status : "OK", message: 'File recieved, parsing' });

            //load the file back up
            //TODO maybe just load the JSON from buffer instead of resource heavy fs
            let obj;
            fs.readFile('tmp/temp.json', 'utf8', function (err, data) {
                if (err) throw err;
                obj = JSON.parse(data);
                for(var item of obj) {
                    let job = backlog.createJob({name: item.name, sfID: item.sfID, showPageID: item.showPageID});
                    job.save();
                    job.on('succeeded', (result) => {
                        socket.emit('account', { name: job.data.name, status: 'OK' });
                        console.log(`Success for job ${job.data.name}`);
                    });
                    job.on('failed', (err) => {
                        socket.emit('account', { name: job.data.name, status: err.message });
                        console.log(`Job ${job.id} failed with error ${err.message}`);
                    });
                }
            });
        });
    });
});

backlog.process(function (job, done) {
    console.log(`Processing job ${job.id}`);

    let url = "https://intellum.exceedlms.com/accounts/show/" + job.data.showPageID;
    jsCon.sobject("Account").update({
        Id: job.data.sfID,
        Show_Page__c : url
    }).then(function(res) {
        console.log(res);
        if (res.success == true) {
            return done(null, job.data.name);
        } else {
            return done("error");
        }
    }, function(err) {
        return done(err);
    });
});

app.listen(3000);
