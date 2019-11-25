const fs = require('fs');
var currentWorkingFunction = null;
var dictionary = {};

function getInputInfo(pythonFiles){
    let info = pythonFiles.map(pythonFile => { return { file: pythonFile, info: extractInfo(pythonFile) }; });
    return info;
}

function extractInfo(pythonFile){
    console.log('Analyzing inputs in ' + pythonFile + '\n');
    let content = fs.readFileSync(pythonFile, 'utf8').replace(/\n    /g, '\n\t');
    let lines = content.split('\n').map((line)=>line.replace(/    /g, '\t'));
    console.log("\nasdf1\n");

    let newFunctionRegExp = /[\t\n]def\s/;
    let varDecRegExp = /[^\!\=]=[^=]/;
    
    for(let line of lines){
        console.log("line is: "+ line);
        if(varDecRegExp.test(line)){
            console.log("\nasdf2\n");
            let varDec = line.split('=');
            let varName = varDec[0].trim();
            let rExpression = varDec[1].trim();
            currentWorkingFunction[varName] = getDependencies(rExpression);
        }
        else if(newFunctionRegExp.test(line)){
            console.log("\nasdf3\n");
            let functionName = line.split('def')[1].split('(')[0].trim();
            dictionary[functionName] = {};
            currentWorkingFunction = dictionary[functionName];
        }

        if(line.indexOf('(') != -1){
            console.log("\nasdf4\n");
            let parts = line.split(/\(\,\)/);
            
            let functionName = parts[0].match(/[^\s=]+\s*$/).trim();

            let params = parts.slice(1, -1).map(param => param.trim());
            
            getDefUse(params);
        }
    }
}

function getDependencies(rExpression){
    console.log("\nasdf5\n");
    let dependencies = [];
    for (let variable in currentWorkingFunction){
        if (rExpression.indexOf(variable) !== -1){
            dependencies.push(variable);
        }
    }
    return dependencies;
}

function getDefUse(variables){
    currentWorkingFunction[variable];
}

module.exports = { getInputInfo: getInputInfo };
