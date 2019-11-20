const fs = require("fs");
const express = require("express");
const cors = require("cors");
const git = require('simple-git/promise');
const shell = require('shelljs');
const analyze = require("./analyze.js")


const app = express();
app.use(cors());

app.get('/',function(req,res){
    res.send("It's working!");
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

    analyze.injectPythonCode();

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
                    "functionCalls": 10
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