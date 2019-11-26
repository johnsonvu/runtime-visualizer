const fs = require('fs');

let fileFunctionDict = {};
let callsDictionary = {};

function makeCallGraph(pythonFiles){
    const nonTestFiles = findNonTestFiles(pythonFiles);
    nonTestFiles.forEach(findFunctions);
    // console.log(JSON.stringify(fileFunctionDict));
    nonTestFiles.forEach(findCalls);
    // console.log(JSON.stringify(callsDictionary));

    return callsDictionary;
}

function findFunctions(filePath){
    let pythonClass = fs.readFileSync(filePath, 'utf8')
    .replace(/\n[\t\s]+/g, sv => { sv.replace('    ', '\t'); return sv; })
    .replace(/\s+/g, ' ');

    fileFunctionDict[filePath] = [];

    pythonClass.split(/\t*def\s/g)
        .slice(1)
        .forEach(code => {
            if(!code.trim().startsWith('def')){
                let end = code.indexOf('(');
                let functionName = code.substring(0, end);
                fileFunctionDict[filePath].push(functionName);
            }
        });
}

function findCalls(filePath){
    let pythonClass = fs.readFileSync(filePath, 'utf8')
    .replace(/\n[\t\s]+/g, sv => sv.replace('    ', '\t'))
    .replace(/\s+/g, ' ');

    let functionDefs = pythonClass.split(/\t*def\s/g).slice(1);

    for(let i=0; i< functionDefs.length; i++){
        let code = functionDefs[i];
        if(code.trim().startsWith('def')) continue;

        let end = code.indexOf('(');
        let functionName = code.substring(0, end);

        callsDictionary[functionName] = {};
        callsDictionary[functionName].calls = [];
        callsDictionary[functionName].file = filePath;

        code = code.substring(end+1);

        for(let file in fileFunctionDict){
            for(let callee of fileFunctionDict[file]){
                if(code.indexOf(callee + '(') !== -1 || code.indexOf(callee + ' (') !== -1){
                    callsDictionary[functionName].calls.push({ fcn: callee, file: file });
                }
            }
        }
    }
}

function toJohnsonGraph(callsDict){
    let nodes = [];
    let links = [];

    for(let caller in callsDict){
        let callerInfo = callsDict[caller];
        let node = {
            "id": callerInfo.file + "." + caller,
            "name": caller,
            "color": randomColor(),
            "val": 50,
            "metadata": {
                // "lines": 1,
                // "variables": 1,
                // "calls": 1
            }
        };

        nodes.push(node);
    }

    let uniqueLinkId = 0;

    for(let caller in callsDict){
        let callerInfo = callsDict[caller];
        for(let callee of callerInfo.calls){
            let edge = {
                "id": uniqueLinkId++,
                "source": callerInfo.file + "." + caller,
                "target": callee.file + "." + callee.fcn,
                "width": 1,
                "color": "#999",
                "distance": 100,
                "name": "No info"
            };

            links.push(edge);
        }
    }

    return { "nodes": nodes, "links": links };
}

function randomColor(){
    switch (Math.floor(Math.random() * 6)){
        case 0:
            return "#FF2424";
        case 1:
            return "#2FFF24";
        case 2:
            return "#2478FF";
        case 3:
            return "#FFFF88";
        case 4:
            return "#24E5FF";
        case 5:
            return "#FF24D7";
        default:
            return "#AAAAAA";
    }
}


function findNonTestFiles(filePaths){
    return filePaths.filter((filePath) => {
        return !filePath.toLowerCase().includes("test");
    });
}

module.exports = { makeCallGraph: makeCallGraph, toJohnsonGraph: toJohnsonGraph };