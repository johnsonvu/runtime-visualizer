const fs = require("fs");

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + "/analyze");
    console.log(JSON.stringify(pythonFiles));
    pythonFiles.forEach(injectRefelctions);
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + "/" + fileName
            if(fullFilePath.endsWith(".py")){
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
    let contents = fs.readFileSync(filePath, "utf8").split('\n');
    let modifiedContent = injectCallCode(contents); 
}

function injectCallCode(fileContent){
    var modifiedContent =[];
    //var spacePttrn = '/^\\s*/';
    for(var i = 0; i <fileContent.length; i++ ){
        var line = fileContent[i];
        modifiedContent.push(line);
        if(line.trim().startsWith('def')){
           //var numSpaces = line.match(spacePttrn)[0].lenth;
            modifiedContent.push('print "{} --> {}".format(inspect.stack()[1][3], inspect.stack()[0][3])')
        }
    }
    console.log(modifiedContent);
    return fileContent
}
  
  
module.exports = { injectPythonCode: injectPythonCode };
