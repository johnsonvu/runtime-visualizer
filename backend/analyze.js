const fs = require('fs');
const inputAnalyzer = require('./analyze/inputAnalysis.js');
const runtimeAnalyzer = require('./analyze/runtimeAnalysis.js');

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + '/analyze');
    let inputInfo = inputAnalyzer.getInputInfo(pythonFiles);
    runtimeAnalyzer.analyzeRuntime(pythonFiles, inputInfo);
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + '/' + fileName
            if(fullFilePath.endsWith('.py')){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                let subPythonFiles = findPythonFiles(fullFilePath);
                pythonFiles = pythonFiles.concat(subPythonFiles);
            }
        });

    return pythonFiles;
}

function injectRefelctions(filePath){
    let contents = fs.readFileSync(filePath, 'utf8').split('\n').map((line)=>line.replace(/    /g, '\t'));
    let modifiedContent = injectReflectionCode(contents);
    console.log(modifiedContent);
    //fs.writeFileSync(filePath, modifiedContent);
}

function numOfTabs(line){
    let i = 0;
    let count = 0;
    while(line.charAt(i++) === '\t'){
      count++;
    }

    return count;
}

function injectReflectionCode(fileContent){
    let modifiedContent = [];
    modifiedContent.push('from memory_profiler import profile\r');
    modifiedContent.push('import inspect\r');
    modifiedContent.push('from codeAnalyzer import codeAnalyzer\r');
    for(let i = 0; i <fileContent.length; i++ ){
        let line = fileContent[i];
        modifiedContent.push(line);
        if(line.trim().startsWith('def')){
            let numTabs = numOfTabs(line);
            var functionName = line.split('def')[1].split('(')[0].trim();
            modifiedContent.push('\t'.repeat(numTabs + 1) + 'functionName = '+ functionName +'\r');
            // modifiedContent.push('\t'.repeat(numTabs + 1) + 'print "{} --> {}".format(inspect.stack()[1][3], functionName)\r');
        }
    }
    //console.log(modifiedContent);
    let stringContent = "";
    for(let i = 0; i <modifiedContent.length; i++ ){
        stringContent = stringContent.concat(modifiedContent[i]);
    }
    return stringContent
}

module.exports = { injectPythonCode: injectPythonCode };
