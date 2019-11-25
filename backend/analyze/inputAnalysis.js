const fs = require('fs');
var mainFunction = {};
var currentWorkingFunction = mainFunction;
var dictionary = {};

function getInputInfo(pythonFiles){
    let info = pythonFiles.map(pythonFile => { return { file: pythonFile, info: extractInfo(pythonFile) }; });
    return info;
}

function extractInfo(pythonFile){
    console.log('Analyzing inputs in ' + pythonFile + '\n');
    let content = fs.readFileSync(pythonFile, 'utf8')
        .replace(/\n    /g, '\n\t')
        .replace(/(?:[\[\,])\s*\r?\n\t*/g, sv => sv.charAt(0)==='[' ? '[' : sv.charAt(0)===',' ? ',' : '')
        .replace(/\n\t*\]/g, ']');
    let lines = content.split('\n').map((line)=>line.replace(/    /g, '\t'));

    let newFunctionRegExp = /[\t\n]def\s/;
    let varDecRegExp = /[^\!\=]=[^=]/;
    
    for(let line of lines){
        console.log(line);
        if(varDecRegExp.test(line)){
            let varDec = line.split('=');
            let varName = varDec[0].trim();
            let rExpression = varDec[1].trim();
            console.log("justin1");
            currentWorkingFunction[varName] = [];
            console.log("justin3");
            currentWorkingFunction[varName] = getDependencies(rExpression);
            console.log("justin2");
        }
        else if(newFunctionRegExp.test(line)){
            let functionName = line.split('def')[1].split('(')[0].trim();
            dictionary[functionName] = {};
            currentWorkingFunction = dictionary[functionName];
        }
        console.log(line);

        if(line.indexOf('(') != -1){
            let parts = line.split(/\(\,\)/);
            
            let functionName = parts[0].match(/[^\s=]+\s*$/).trim();

            for (let i=1; i<parts.length-1; i++){
                let input = part[i].trim();
                getDefUse(input);
            }
        }
        console.log(line);
    }
}

function getDependencies(rExpression){
    console.log('hello');
    let dependencies = [];
    for (let variable in currentWorkingFunction){
        if (rExpression.indexOf(variable) !== -1){
            dependencies.push(variable);
        }
    }
    console.log('world');
    return dependencies;
}

function getDefUse(variable){
    currentWorkingFunction[variable];
}

module.exports = { getInputInfo: getInputInfo };
