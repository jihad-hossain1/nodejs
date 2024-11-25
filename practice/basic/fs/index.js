const fs = require("fs");

// file path
const filePath = "./practice/basic/fs/file/test.txt";

// asynchronous method
const fileReader = () => {
    const readFile = fs.readFile(filePath, "utf-8", (err, data) => {
        if (err) {
            console.log("error reading file:", err);
            return;
        }
        console.log("file content:", data);
    });

    return readFile;
};

// synchronous method
const fileReadAsync = () => {
    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        console.log('file content: ',fileContent)
        return;
    } catch (er) {
        console.log("error on read file: ", er);
    }
};

// write file
const writeFile = ()=>{
    // const 
}

module.exports = { fileReader, fileReadAsync };
