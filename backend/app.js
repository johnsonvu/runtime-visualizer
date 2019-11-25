const fs = require("fs");
const express = require("express");
const cors = require("cors");
const git = require('simple-git/promise');
const shell = require('shelljs');
const analyze = require("./analyze.js")

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(cors());

const exampleData = {
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

app.get('/',function(req,res){
    res.send("It's working!");
});

// This is an example of downloading a git repository
app.post('/analyze', function(req, res) {
    // define repo to clone
    const repo = req.body.repoLink;
    if(!repo) {
        return res.status(402).send("Repository link was invalid");
    }

    // delete the repo directory if already cloned before
    shell.rm('-rf', 'analyze/repo');
    git().silent(true)
        .clone(repo, 'analyze/repo')
        .then(() => {
            // once downloaded, you can trigger injection + analysis

            // call graph

            // run time
            analyze();

            // memory

            // join the data into a JSON

            // then post the results/data
            return res.send(JSON.stringify(exampleData));
        })
        .catch((err) => {return res.status(401).send("There was an error cloning " + err)});
});

app.listen(3001, () => {})