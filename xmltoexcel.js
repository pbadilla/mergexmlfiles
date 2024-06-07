const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const xlsx = require('xlsx');

const inputFile = './merged_one_file.xml'; // Path to the merged XML file
const outputFile = './output.xlsx'; // Path to the output Excel file

const parser = new xml2js.Parser();

// Function to convert JSON to Excel
const convertJsonToExcel = (json) => {
    const workbook = xlsx.utils.book_new();
    const worksheetData = [];

    // Extract the items from the JSON
    const items = json.root.item;
    if (!items) {
        console.error("No items found in the XML file.");
        return;
    }

    // Prepare worksheet headers
    const headers = Object.keys(items[0]);
    worksheetData.push(headers);

    // Prepare worksheet data
    items.forEach((item) => {
        const row = headers.map((header) => item[header][0]);
        worksheetData.push(row);
    });

    // Create worksheet
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write to Excel file
    xlsx.writeFile(workbook, outputFile);
    console.log('Excel file saved as', outputFile);
};

// Read and parse the XML file
fs.readFile(inputFile, (err, data) => {
    if (err) throw err;

    parser.parseString(data, (err, result) => {
        if (err) throw err;

        // Convert parsed JSON to Excel
        convertJsonToExcel(result);
    });
});
