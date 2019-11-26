const fs = require('fs');
const callGraphGenerator = require('./analyze/callGraph.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');
const memoryAnalyzer = require('./analyze/memoryAnalysis');

const testedCalls = [];
const maxWidth = 100;
const minWidth = 1;
const maxSize = 120;
let maxCalls = 0;
let minCalls = 0;
let maxMemory;

var subFolderDict = {};
// invokes runtime and memory analysis and outputs their results
const doAnalysis = (testCommand) => {
    let pythonFiles = findPythonFiles(__dirname + '/analyze/repo', 1);
    // let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    let callGraph = callGraphGenerator.makeCallGraph(pythonFiles);
    let johnsonGraph = callGraphGenerator.toJohnsonGraph(callGraph);
    console.log("Call graph generation completed.");
    let runtimeResult =  runtimeAnalyzer.analyzeRuntime(pythonFiles, subFolderDict, testCommand);
    console.log("Runtime analysis completed.");
    let memoryResult = memoryAnalyzer.analyzeMemoryUsage(pythonFiles, testCommand);
    console.log("Memory analysis completed.");
    // console.log(memoryResult);
    console.log("Analysis completed.");

    // merge results
    console.log("Runtime Analysis Graph creation...");
    mergeRuntimeAnalysis(johnsonGraph, runtimeResult);
    console.log("Memory Analysis Graph creation...");
    mergeMemoryAnalysis(johnsonGraph, memoryResult);
    console.log("Graphs completed!");

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
    for(let edge of johnsonGraph.links){
        let allCalls = [];
        for(let test in runtimeResult){
            let calls = runtimeResult[test].filter(rt => edge.source.endsWith(rt.caller) && edge.target.endsWith(rt.callee));
            
            if (calls.length>0){
                let total = calls.reduce((sum, call) => sum  + call.occurance, 0);
                let average = total / calls.length;
                allCalls.push({total: total, avg: average});
            }
        }
        
        if(allCalls.length>0) {
            let total = allCalls.reduce((sum, callInfo) => sum + callInfo.total, 0);
            let average = allCalls.reduce((sum, callInfo) => sum + callInfo.avg, 0)/allCalls.length;
            edge.width = total;
            edge.name = `${total} calls\n${average} per caller average`;
            testedCalls.push(edge.id);

            maxCalls = Math.max(maxCalls, total);
            minCalls = Math.min(minCalls, total);
        }
    }

    johnsonGraph.links.forEach(edge => {
        if (!testedCalls.includes(edge.id)) return;
        edge.width = scaleWidth(edge.width);
        edge.length = scaleLengthFromWidth(edge.width);
    });
}

function mergeMemoryAnalysis(johnsonGraph, memoryResult) {
    // console.log(johnsonGraph.nodes)
    for (let node of johnsonGraph.nodes) {
        const result = memoryResult.get(node.id);
        // console.log(node.id + " " + result);
        node.val = result ? result : 4; // if no memory is given, defaults to val 4
    }
}

function scaleWidth(width){
    return Math.max(width * (maxWidth - minWidth) / (maxCalls - minCalls), minWidth);
}
function scaleLengthFromWidth(width){
    return Math.min(500, Math.max(width*8, 100));
}

module.exports = doAnalysis;
