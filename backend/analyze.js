const fs = require("fs");

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + "/analyze");
    console.log(JSON.stringify(pythonFiles));
}

function findPythonFiles(directory){
    console.log("directory is: " + directory);
    let pythonFiles = [];
    fs.readdirSync(directory)
        .forEach((fileName) => {
            let fullFilePath = directory + "/" + fileName
            console.log(fullFilePath);
            if(fullFilePath.endsWith(".py")){
                pythonFiles.push(fullFilePath);
            }
            else if(fs.statSync(fullFilePath).isDirectory()){
                findPythonFiles(fullFilePath);
            }
        });

    return pythonFiles;
}
  
module.exports = { injectPythonCode: injectPythonCode };