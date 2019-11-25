const fs = require('fs');
const callGraphGenerator = require('./analyze/callGraph.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');
const memoryAnalyzer = require('./analyze/memoryAnalysis');

const maxWidth = 100;
const minWidth = 1;
const maxSize = 120;
let maxCalls = 0;
let minCalls = 0;
let maxMemory;

var subFolderDict = {};
// invokes runtime and memory analysis and outputs their results
const doAnalysis = (testCommand) => {
    // 1 is for
    let pythonFiles = findPythonFiles(__dirname + '/analyze/repo', 1);
    // let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    //let memoryResult = memoryAnalyzer.analyzeMemoryUsage(pythonFiles, testCommand);
    let callGraph = callGraphGenerator.makeCallGraph(pythonFiles);
    let johnsonGraph = callGraphGenerator.toJohnsonGraph(callGraph);
    let runtimeResult =  runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict, testCommand);
    console.log("Runtime analysis completed.")
    // let memoryResult = memoryAnalyzer.analyzeMemoryUsage(pythonFiles, testCommand);
    console.log("Memory analysis completed.")
    // console.log(memoryResult);
    console.log("Analysis completed.");

    mergeRuntimeAnalysis(johnsonGraph, runtimeResult);

    // return [null, memoryResult];

    // runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict);

    // console.log(JSON.stringify(johnsonGraph));
    return johnsonGraph;
}

function findPythonFiles(directory, level){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName
            if(fullFilePath.endsWith('.py')){
                pythonFiles.push(fullFilePath);
                subFolderDict[fullFilePath] = level;
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath, level+1);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

function mergeRuntimeAnalysis(johnsonGraph, runtimeResult){
    // for(let node of johnsonGraph.nodes){
    //     runtimeResult.find(result => result.fileName + result.)
    // }
    console.log("HERE");
    // console.log("what is runtime result?\n");
    // console.log(JSON.parse(runtimeResult));
    for(let test in runtimeResult){
        console.log("what is test? " + test + "\n");
        console.log("runtime[test]:\n");
        console.log(runtimeResult[test]);
        maxCalls = Math.max(maxCalls, runtimeResult[test].reduce((biggest, curr) => Math.max(biggest, curr.occurance), 0));
    }
    console.log("WE");
    for(let test in runtimeResult){
        minCalls = Math.min(minCalls, runtimeResult[test].reduce((smallest, curr) => Math.min(smallest, curr.occurance), runtimeResult[test][0].occurance));
    }
    console.log("Go");
    console.log("***********************************************************************************************************************************************");
    console.log(maxCalls);
    console.log(minCalls);

    for(let edge of johnsonGraph.links){
        let runtime = null;
        for(let test in runtimeResult){
            console.log("edge source target: ");
            console.log(edge.source);
            console.log(edge.target);
            runtime = runtimeResult[test].find(rt => {
                
                console.log('\n\n');
                console.log("rtname + caller callee");
                console.log(rt.fileName + rt.caller);
                console.log(rt.fileName + rt.callee);
                return edge.source.endsWith(rt.caller) && edge.target.endsWith(rt.callee)
            });
            if(runtime != null) break;
        }
        
        if(runtime!=null) {
            console.log("WE DID IT");
            // console.log("runtime is : " + JSON.parse(runtime));
            // console.log("runtime.occ is : " + runtime.occurance);
            edge.width = scaleWidth(runtime.occurance);
        }
    }
}

function scaleWidth(width){
    return Math.max(width * (maxWidth - minWidth) / (maxCalls - minCalls), minWidth);
}

module.exports = doAnalysis;
