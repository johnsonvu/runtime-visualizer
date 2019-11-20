const fs = require("fs");

const injectPythonCode = () => {
    let pythonFiles = findPythonFiles(__dirname + "/analyze");
    console.log(JSON.stringify(pythonFiles));
    readFile();
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

function readFile(){
    var input = 'C:\\Users\\Leonl\\OneDrive\\Documents\\cpsc 410\\runtime-visualizer\\exampleProjects\\LibraryBook.py';

    fs.readFile(input, 'utf8', function (err, data) {
        if(err)
            return console.log(err);
        console.log('Result: ' + data);
    });
}
  
  
module.exports = { injectPythonCode: injectPythonCode };
