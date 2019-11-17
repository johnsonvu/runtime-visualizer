var fs = require("fs");
var express = require("express");
const app = express();

var extract = require("extract-zip");


app.get('/',function(req,res){
    res.send("Hello Johnson!");
});

app.listen(3001, () => {})