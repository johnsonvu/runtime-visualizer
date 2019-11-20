const fs = require("fs");

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles("analyze/repo/");
    console.log(JSON.stringify(pythonFiles));
}

function findPythonFiles(directory){
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath =  + fileName
            if(fileName.endsWith(".py")){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                findPythonFiles(fullFilePath + "/");
            }
        });

    return pythonFiles;
}
  
module.exports = { injectPythonCode: injectPythonCode };