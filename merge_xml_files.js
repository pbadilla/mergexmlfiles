const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const builder = new xml2js.Builder();

const inputDir = './xml_files'; // Directory containing your XML files
const outputFile = './merged.xml';

// Function to sanitize XML data
const sanitizeXML = (data) => {
    // Sanitize XML to ensure no invalid characters are present
    return data.replace(/[^\x20-\x7E\x09\x0A\x0D]/g, '');
};

fs.readdir(inputDir, (err, files) => {
    if (err) throw err;

    let mergedData = { root: { item: [] } };

    files.forEach((file, index) => {
        const filePath = path.join(inputDir, file);

        // Read and parse each XML file
        fs.readFile(filePath, (err, data) => {
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
});
