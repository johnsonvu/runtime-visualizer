var fs = require("fs");
var express = require("express");
var cors = require("cors");

const app = express();
app.use(cors());

var extract = require("extract-zip");


app.get('/',function(req,res){
    res.send("Hello Johnson!");
});

// This is an example of how the data should be formatted
app.get('/example',function(req,res){
    const data = {
        "nodes": [
            {
                "id": "1",
                "name": "node1",
                "color": "red",
                "val": 20
            },
            {
                "id": "2",
                "name": "node2",
                "color": "green",
                "val": 10
            },
            {
                "id": "3",
                "name": "node3",
                "color": "blue",
                "val": 50
            }
        ],
        "links": [
            {
                "source": "1",
                "target": "2",
                "width": 5,
                "color": "#999",
                "distance": 60
            },
            {
                "source": "3",
                "target": "2",
                "width": 1,
                "color": "#999",
                "distance": 100
            }
        ]
    };

    res.send(JSON.stringify(data));
});

app.listen(3001, () => {})