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

let max = 764;
let scale = max/128;

const userTestData = {
    "nodes": [
        {
            "id": "0",
            "name": "__main__",
            "color": "green",
            "val": 120,
            "metadata": {
                "Lines": 20
            }
        },
        {
            "id": "1",
            "name": "findTopThreeAverageRating()",
            "color": "green",
            "val": 20,
            "metadata": {
                "Lines": 20,
                "Inputs": "self",
                "Input Types": "object",
                "Calls": 1
            }
        },
        {
            "id": "2",
            "name": "forloop1",
            "color": "green",
            "val": 10,
            "metadata": {
                "Lines": 5,
                "Inputs": "self.mylist",
                "Input Types": "array",
                "Calls": 23
            }
        },
        {
            "id": "3",
            "name": "forloop2",
            "color": "yellow",
            "val": 10,
            "metadata": {
                "Lines": 5,
                "Inputs": "self.mylist",
                "Input Types": "array",
                "Calls": 266
            }
        },
        {
            "id": "4",
            "name": "forloop3",
            "color": "red",
            "val": 10,
            "metadata": {
                "Lines": 5,
                "Inputs": "self.mylist",
                "Input Types": "array",
                "Calls": 764
            }
        },
        {
            "id": "5",
            "name": "sumThreeNumbers",
            "color": "green",
            "val": 3,
            "metadata": {
                "Lines": 1,
                "Inputs": "self, largest1, largest2, largest3",
                "Input Types": "array, number, number, number",
                "Calls": 1
            }
        },
        {
            "id": "9000",
            "name": "getLowestRating()",
            "color": "green",
            "val": 3,
            "metadata": {
                "Lines": 1,
                "Inputs": "self",
                "Input Types": "object",
                "Calls": 1
            }
        }
    ],
    "links": [
        {
            "id": "1",
            "source": "1",
            "target": "2",
            "width": 23/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "23 calls average"
        },
        {
            "id": "2",
            "source": "2",
            "target": "3",
            "width": 266/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "12.5 calls average"
        },
        {
            "id": "3",
            "source": "3",
            "target": "4",
            "width": 764/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "6.25 calls average"
        },
        {
            "id": "4",
            "source": "1",
            "target": "5",
            "width": 1/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "1 call average"
        },
        {
            "id": "9000",
            "source": "0",
            "target": "1",
            "width": 1/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "1 call average"
        },
        {
            "id": "9001",
            "source": "0",
            "target": "9000",
            "width": 1/scale+1,
            "color": "#999",
            "distance": 100,
            "name": "1 call average"
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
    const testCmd = req.body.testCmd;
    if(!repo) {
        return res.status(402).send("Repository link is invalid");
    }
    if(!testCmd) {
        return res.status(403).send("Test command is invalid");
    }

    // delete the repo directory if already cloned before
    shell.rm('-rf', 'analyze/repo');
    git().silent(true)
        .clone(repo, 'analyze/repo')
        .then(() => {
            // inject + analyze + run tests
            let johnsonGraph = analyze(testCmd);

            console.log(JSON.stringify(johnsonGraph));
            // then post the results/data
            return res.send(JSON.stringify(johnsonGraph));
        })
        .catch((err) => {return res.status(401).send("There was an error cloning " + err)});
});

app.listen(3001, () => {})