var fs = require("fs");
var express = require("express");
var cors = require("cors");
const git = require('simple-git/promise');
var shell = require('shelljs');

const app = express();
app.use(cors());

app.get('/',function(req,res){
    res.send("Hello Johnson!");
});

// This is an example of downloading a git repository
app.get('/download', function(req, res) {
    // delete the repo directory if already cloned before
    shell.rm('-rf', 'analyze/repo');

    // define repo to clone
    const repo = 'https://github.com/dnephin/Sudoku-Solver';
    git()
        .silent(true)
        .clone(repo, 'analyze/repo')
        .then(() => res.status(201).send("Successfully cloned the repository"))
        .catch((err) => res.status(401).send("There was an error cloning " + err))

    // once downloaded, you can trigger some sort of analysis (i.e. using shelljs)
    // shell.cd(path);
    // shell.exec(cmd);

    // then post the results/data
    // res.send(data);
});

// This is an example of how the data should be formatted
app.get('/example',function(req,res){
    const data = {
        "nodes": [
            {
                "id": "1",
                "name": "node1",
                "color": "red",
                "val": 20,
                "metadata": {
                    "lines": 200,
                    "variables": 4,
                    "calls": 10
                }
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
            },
            {
                "id": "4",
                "name": "node4",
                "color": "blue",
                "val": 10,
                "metadata": {
                    "lines": 200,
                    "variables": 4,
                    "calls": 10
                }
            }
        ],
        "links": [
            {
                "id": "1",
                "source": "1",
                "target": "2",
                "width": 5,
                "color": "#999",
                "distance": 60,
                "name": "called 12 times"
            },
            {
                "id": "2",
                "source": "3",
                "target": "2",
                "width": 1,
                "color": "#999",
                "distance": 100
            },
            {
                "id": "3",
                "source": "2",
                "target": "4",
                "width": 5,
                "color": "#999",
                "distance": 50
            }
        ]
    };

    res.send(JSON.stringify(data));
});

app.listen(3001, () => {})