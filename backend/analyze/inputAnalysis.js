const fs = require('fs');
var currentWorkingFunction = null;
var dictionary = {};

function getInputInfo(pythonFiles){
    let info = pythonFiles.map(pythonFile => { return { file: pythonFile, info: extractInfo(pythonFile) }; })};
    return info;
}

function extractInfo(pythonFile){
    console.log('Analyzing inputs in ' + pythonFile + '\n');
    let content = fs.readFileSync(pythonFile, 'utf8').replace(/\n    /g, '\n\t');
    let lines = content.split('\n').map((line)=>line.replace(/    /g, '\t'));

    let newFunctionRegExp = /[\t\n]def\s/;
    let varDecRegExp = /[^\!\=]=[^=]/;
    let functionCallRegExp = /[^\!\=]=[^=]/;
    
    for(let line of lines){
        if(varDecRegExp.test(line)){
            let varDec = line.split('=');
            let varName = varDec[0].trim();
            let rExpression = varDec[1].trim();
            currentWorkingFunction[varName] = getDependencies(rExpression);
        }
        else if(newFunctionRegExp.test(line)){
            let functionName = line.split('def')[1].split('(')[0].trim();
            dictionary[functionName] = {};
            currentWorkingFunction = dictionary[functionName];
        }

        if(line.indexOf('(') != -1){
            let parts = line.split(/\(\,\)/);
            
            let functionName = parts[0].match(/[^\s=]+\s*$/).trim();

            for (let i=1; i<parts.length-1; i++){
                let input = part[i].trim();
                getDefUse(input);
            }
        }
    }
}

function getDependencies(rExpression){
    let dependencies = [];
    for (let variable in currentWorkingFunction){
        if (rExpression.indexOf(variable) !== -1){
            dependencies.push(variable);
        }
    }
    return dependencies;
}

function getDefUse(variable){
    currentWorkingFunction[variable];
}

module.exports = { getInputInfo: getInputInfo };
