const fs = require("fs");

const _file =  '../basic/fs/file/write.txt'
// append to file synchronous
const appendFileSync = (text) => {
    try {
        const file = fs.appendFileSync(_file, `\n${text}`);
        console.log("append ok.");
        return file;
    } catch (error) {
        console.log("error on append file: ", error);
    }
};

appendFileSync('line added realtime change tracking 1')