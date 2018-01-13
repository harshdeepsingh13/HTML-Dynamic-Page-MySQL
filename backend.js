var http = require('http');
var sql = require('mysql');
var fileServer = require('fs');
var url = require('url');
var util = require('util');
var formidable = require('formidable');


http.createServer(function (req,res) {
    res.writeHead(200,{'Content-Type':'text/html'});
    if(req.method.toLowerCase()=='post')
    {
        var name,contact;
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,files)
        {
            console.log(util.inspect({fields:fields,files:files}));
            name = fields.name;
            contact = fields.contact;
            console.log(name + " " + contact);
        });
        var con = sql.createConnection({
            host:'localhost',
            user:'root',
            password:'root',
            database:'mydata',
            multiplestatements:true
        });
        con.connect(function(err){
            var query;
            /*query='create databse if not exists mydata;'
            con.query(query,function (err) {
                if(err) throw err;
            });*/
            query='create table if not exists mytable(name varchar(20),contact bigint not null primary key);';
            con.query(query,function (err) {
                if(err) throw err;
            });
            query='insert into mytable values("' + name + '","' + contact + '");';
            con.query(query,function(err){
                if(err) throw err;
            });
            query='select * from mytable where name="' + name +'" and contact="' + contact+'";';
            con.query(query,function (err,result,fields) {
                var resultName,resultContact;
                console.log(result);
                resultName = result[0].name;
                resultContact = result[0].contact;
                fileServer.readFile('result.html',function(err,data){
                    if(err) throw err;
                    res.write(data);
                    var pendingResult = '<table>\n' +
                        '    <tr>\n' +
                        '        <td> Name :</td>\n' +
                        '        <td>'+resultName +
                        '        </td>\n' +
                        '    </tr>\n' +
                        '    <tr>\n' +
                        '        <td> Contact: </td>\n' +
                        '        <td>\n' + resultContact +
                        '        </td>\n' +
                        '    </tr>\n' +
                        '</table>\n' +
                        '\n' +
                        '</body>\n' +
                        '</html>';
                    res.write(pendingResult);
                    res.end();
                });

            })
        });
    }
    else if(req.method.toLowerCase()=='get')
    fileServer.readFile('data.html',function(err,data){
        if(err) throw err;
        res.write(data);

        res.end();
    })

}).listen(8080);