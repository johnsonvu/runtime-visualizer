const fs = require('fs');
const callGraphGenerator = require('./analyze/callGraph.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');
const memoryAnalyzer = require('./analyze/memoryAnalysis');

const maxWidth = 100;
const minWidth = 1;
const maxSize = 120;
let maxCalls;
let minCalls;
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
    
    maxWidth = runtimeResult.reduce((largest, current) => Math.max(largest, current.occurance), 0);
    minWidth = runtimeResult.reduce((smallest, current) => Math.min(smallest, current.occurance), runtimeResult[0].occurance);

    for(let edge of johnsonGraph.links){
        let runtime = runtimeResult.find(runtime => runtime.fileName + runtime.caller === edge.source && runtime.fileName + runtime.callee === edge.target);
        edge.width = scaleWidth(runtime.occurance);
    }
}

function scaleWidth(width){
    return Math.max(width * (maxWidth - minWidth) / (maxCalls - minCalls), minWidth);
}

module.exports = doAnalysis;
