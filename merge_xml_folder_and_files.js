const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const inputDir = './xml_files'; // Directory containing your XML files
const outputFile = './merged_one_file.xml';

let mergedData = { root: { item: [] } };

// Function to sanitize XML data
const sanitizeXML = (data) => {
    return data.replace(/[^\x20-\x7E\x09\x0A\x0D]/g, '');
};

// Recursive function to read files from a directory
const readFilesRecursively = (dir, done) => {
    let results = [];
    fs.readdir(dir, (err, list) => {
        if (err) return done(err);
        let pending = list.length;
        if (!pending) return done(null, results);

        list.forEach((file) => {
            const filePath = path.resolve(dir, file);
            fs.stat(filePath, (err, stat) => {
                if (stat && stat.isDirectory()) {
                    readFilesRecursively(filePath, (err, res) => {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(filePath);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

// Process the XML files
const processFiles = (files) => {
    files.forEach((file, index) => {
        fs.readFile(file, (err, data) => {
            if (err) throw err;

            const sanitizedData = sanitizeXML(data.toString());

            parser.parseString(sanitizedData, (err, result) => {
                if (err) {
                    console.error(`Error parsing XML file ${file}:`, err);
                    return;
                }

                // Merge the <item> elements
                if (result.root && result.root.item) {
                    mergedData.root.item = mergedData.root.item.concat(result.root.item);
                }

                // Once all files are read and parsed, build and save the merged XML
                if (index === files.length - 1) {
                    const xml = builder.buildObject(mergedData);
                    fs.writeFile(outputFile, xml, (err) => {
                        if (err) throw err;
                        console.log('Merged XML saved as', outputFile);
                    });
                }
            });
        });
    });
};

// Read all files recursively and process them
readFilesRecursively(inputDir, (err, files) => {
    if (err) throw err;
    processFiles(files);
});
