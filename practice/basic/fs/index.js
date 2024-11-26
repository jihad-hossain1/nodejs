const fs = require("fs");

// file path
const readFilePath = "./practice/basic/fs/file/test.txt";
const writeFilePath = "./practice/basic/fs/file/write.txt";

// asynchronous method
const fileReader = () => {
    const readFile = fs.readFile(readFilePath, "utf-8", (err, data) => {
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
        const fileContent = fs.readFileSync(readFilePath, "utf-8");
        console.log("file content: ", fileContent);
        return;
    } catch (er) {
        console.log("error on read file: ", er);
    }
};

// write file asynchronous
const writeFile = () => {
    const file = fs.writeFile(writeFilePath, "add new line again", (err) => {
        if (err) {
            console.log("errorr write file:", err);
            return;
        }
        console.log("file written successfully");
    });
    return file;
};

// check file are exist or not
function fileExistCheck(filePath) {
    try {
        fs.accessSync(filePath);
        return true;
    } catch (ex) {
        return false;
    }
}

// write file synchronous
const writeFileAsync = () => {
    try {
        const file = fs.writeFileSync(
            writeFilePath,
            "this are synchronous file with add line",
        );
        console.log("synchronous file writen done");
        return file;
    } catch (error) {
        console.log(error);
    }
};

// append to file asynchronous
const appendToFile = () => {
    const file = fs.appendFile(
        writeFilePath,
        "\nAppend a new text asynchronously",
        (err) => {
            if (err) {
                console.log("error appending text on file: ", err);
                return;
            }
            console.log("text append ok");
        },
    );

    return file;
};

const filePathForAppendFile = "./practice/basic/fs/file/write.txt";
// append to file synchronous
const appendFileSync = (text) => {
    const filePathExist = fileExistCheck(filePathForAppendFile);
    try {
        if (filePathExist) {
            const file = fs.appendFileSync(filePathForAppendFile, `\n${text}`);
            console.log("append ok.");
            return file;
        } else {
            console.log("file path are not exist!");
        }
    } catch (error) {
        console.log("error on append file: ", error);
    }
};

// check directory folder are exist
function directoryExist(dir) {
    const folderName = dir.split("/").at(-1);
    try {
        if (fs.existsSync(dir)) {
            console.log(`This "${folderName}" Folder exist, try another name`);
            return true;
        } else {
            console.log(
                `folder are not found, you can create folder name of ${folderName}`,
            );
            return false;
        }
    } catch (error) {
        console.log("directory not found", error);
    }
}

const folderPath = "./practice/basic/fs/file";

// folder create
function createFolder() {
    const directory = directoryExist(folderPath);
    if (directory) {
        console.log("direcory", directory);
        return;
    } else {
        fs.mkdirSync(folderPath);
        console.log("folder created");
    }
}

// read file from folder
const readDirectory = () => {
    const isFolderPath = directoryExist(folderPath);
    if (isFolderPath) {
        const readFilesInFolder = fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.log("you got an error reading files", err);
                return;
            }
            console.log("your files ready: ", files);
        });
        return readFilesInFolder;
    } else {
        console.log("folder path are not found.");
    }
};

// remove directory
const removeDirectory = () => {
    const isDirectoryExist = directoryExist(folderPath);

    if (isDirectoryExist) {
        fs.rmdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.log("You got an Error remove directory: ", err);
                return;
            }
            console.log("Directory remove done.");
        });
    } else {
        console.log("Folder are not exist!");
    }
};

// delete a file async
const deleteFileAsync = () => {
    const isfile = fileExistCheck(writeFilePath);
    if (isfile) {
        const file = fs.unlink(writeFilePath, (err) => {
            if (err) {
                console.log("file are not remove, you got an error: ", err);
                return;
            }
            console.log("file remove done.");
        });

        return file;
    } else {
        console.log("file not found");
    }
};

const deleteFilePath = "./practice/basic/fs/file/write.txt";
// delete file synchronously
const deleteFileSync = () => {
    const isFile = fileExistCheck(deleteFilePath);
    if (isFile) {
        const removeFile = fs.unlinkSync(deleteFilePath);
        console.log("file remove done.");
        return removeFile;
    } else {
        console.log(`This ${deleteFilePath.split("/").at(-1)} are not found`);
    }
};

const filePathForWatch = "./practice/basic/fs/file/write.txt";
// watch file changes
const watchFileChanged = () => {
    const fi = fs.watch(filePathForWatch, (eventType, fileName) => {
        if (fileName) {
            console.log(
                `File ${fileName} has ${eventType}`,
            );
        }
    });

    return fi;
};

module.exports = {
    fileReader,
    fileReadAsync,
    writeFile,
    writeFileAsync,
    appendToFile,
    appendFileSync,
    deleteFileAsync,
    deleteFileSync,
    readDirectory,
    createFolder,
    directoryExist,
    removeDirectory,
    watchFileChanged,
};
