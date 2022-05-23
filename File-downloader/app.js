const csvParser = require('csv-parser');
const Downloader = require("nodejs-file-downloader");
const fs = require('fs');
const path = require('path');

let count = 0;
let row_count = 0;
const file_ext = '.pdf' // ext

let dir = path.join(__dirname, '../../PDF'); //path to download folder
const filepath = './links_csv_example.csv' //path to CSV file

async function fileDownload(url, filename, dir){
  const downloader = new Downloader({
    url: url, //file download url
    directory: dir, //storage dir 4 downloaded files
    fileName: filename, //need to rename download file
    cloneFiles: false, // This will cause the downloader to re-write an existing file.
    maxAttempts: 3, //We set it to 3, but in the case of status code 404, it will run only once.
    shouldStop: function (e) {
      
      if (e.statusCode && e.statusCode === 404) {
        return true; //If you return true, the repetition will not happen. Returning anything else, including undefined, will let the downloader know that you want to continue repeating.
      }
    },
  });
  try {
    await downloader.download(); //Downloader.download() returns a promise.
    count++
    console.log("File " + count + ' done');
  } catch (error) {

    console.log("Download failed: " + filename, error);
  }
}
fs.createReadStream(filepath)
    .on('error', (error) => {
      console.log(error);// handle error
    })

    .pipe(csvParser())
    .on('data', (row) => {
      
      const filename = row['NAME'] + file_ext; //create full filename
      const dir_archive = dir+'/Архивные товары' // archive dir **OPTIONAL U CAN DELETE THIS AND ELSE STATEMENT**

      if (row['LINK'] !== ''){ //check 4 empty link **OPTIONAL U CAN DELETE THIS**
      if (row['ARCHIVE'] === 'N') { //check 4 archive files, and store to different dir  **OPTIONAL U CAN DELETE THIS AND ELSE STATEMENT**
       fileDownload(row['FullLink'], filename, dir)
      }
      else {
       fileDownload(row['FullLink'], filename, dir_archive) 
      }
        // console.log(row);
      }
      else{
        console.log(row['NAME'] + ' dont have link');//print empty link
      }
      row_count++
    })

    .on('end', () => {
      console.log("read " + row_count + " rows" );// handle end of CSV
    })

/*
EXAMPLE of ROW in csv with separator ','
{ARCHIVE: 'N',
  NAME: 'MODEL3',
  LINK: '/upload/iblock/988/g404r1eb7qiqc1e67gjrdxbxoivsdgb9.pdf',
  FullLink:
   'https://yoursite.ru/upload/iblock/988/g404r1eb7qiqc1e67gjrdxbxoivsdgb9.pdf' }

   OR use custom separator - csvParser({ separator: ';' });
*/

//https://www.npmjs.com/package/nodejs-file-downloader
//https://www.npmjs.com/package/csv-parser