const puppeteer = require('puppeteer');
const fs = require('fs');
const waitForAnySelector = require('./helpers.js');
var express = require('express');
const jsCov = require('./jsCoverage.js');
var app = express();
var path = require('path');
var root = process.argv[2];
var appPath = process.argv[1].substr(0, process.argv[1].search('pup_coverage') - 1)
console.log(root)
console.log(appPath)
var arr =((process.argv[2]).split(path.sep)).filter(el=> el!=="");
var last = arr[arr.length-1] || arr[arr.length-2];
//root=path.join(root,last)
var isMain = (element,index) => arr[index].includes("js-framework-benchmark") && arr[index+1]=="frameworks" && arr[index+2]=="keyed"
var mainInd = arr.findIndex(isMain);
var main = path.sep + path.join(...arr.slice(0,mainInd+1))+path.sep;
var siteassets = path.sep+ path.join(main,"css")+path.sep;
console.log(root,main,siteassets)
app.use(express.static(root));
app.use(express.static(main));
app.use(express.static(appPath));
// viewed at http://localhost:8080
app.get('/', function(req, res) {
    res.sendFile(root + '/index.html');
});
var server = app.listen(8080);
(async () => {
  if (process.argv.length < 3) {
    console.log("Please provide argument the path to the local HTML file.")
    return;
  }
  inPath = process.argv[2]
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await Promise.all([
    jsCov.startJSCov(page.coverage)
  ]);
  await page.goto('http://localhost:8080', { waitUntil: 'domcontentloaded' });

  //start

  //buttons
  const clearX = await page.$x('//*[@id="clear"]')
  const addX = await page.$x('//*[@id="add"]')
  const runX = await page.$x('//*[@id="run"]')
  const updateX = await page.$x('//*[@id="update"]') 
  const swapX = await page.$x('//*[@id="swaprows"]') 
  const runlotsX = await page.$x('//*[@id="runlots"]')

  //benchAdd
  if (addX.length > 0 && clearX.length > 0){
    await addX[0].click()
    await clearX[0].click()
  }else{
    console.log("benchAdd failed")
  }
  //benchAdd

  //benchReplaceAll
  if(runX.length > 0 &&  clearX.length > 0){
    await runX[0].click()
    await clearX[0].click()
  }else{
    console.log("benchReplaceAll failed")
  }
  //benchReplaceAll

  //benchUpdate
  if(runX.length > 0 && updateX.length > 0 && clearX.length > 0){
    await runX[0].click()
    for (let i = 0; i < 10; i++) {
      await updateX[0].click()
    }
    await clearX[0].click()
  }else{
    console.log("benchUpdate failed")
  }
  //benchUpdate

  //benchSelect
  if(runX.length > 0 && clearX.length > 0){
    await runX[0].click()
    for (let i = 1; i < 100; i++) {
      const benchSelect = await page.$x(`//tbody/tr[${i}]/td[2]/a`)
      if(benchSelect.length > 0){
        await benchSelect[0].click()
      }
    }
    await clearX[0].click()
  }else{
    console.log("benchSelect failed")
  }
  //benchSelect

  //benchSwapRows
  if(runX.length > 0 && swapX.length > 0 && clearX.length > 0){
    await runX[0].click()
    await swapX[0].click()
    await clearX[0].click()
  }else{
    console.log("benchSwapRows failed")
  }
  //benchSwapRows

  //benchRunBig 
  if(runlotsX.length > 0 && clearX.length > 0){
    await runlotsX[0].click()
    await clearX[0].click()
  }else{
    console.log("benchRunBig failed")
  }
  //benchRunBig

  //benchRemove
  if(runX.length > 0 && clearX.length > 0){
    await runX[0].click()
    for (let i = 1; i < 100; i++) {
      const benchRemove = await page.$x(`//tbody/tr[${i}]/td[3]/a/span[1]`)
      if(benchRemove.length > 0){
        console.log("removing")
        await benchRemove[0].click()
      }
    }
    await clearX[0].click()
  }else{
    console.log("benchRemove failed")
  }
  //benchRemove

  //benchAppendToManyRows
  if(runX.length > 0 && addX.length > 0 && clearX.length > 0){
    await runX[0].click()
    await addX[0].click()
    await clearX[0].click()
  }else{
    console.log("benchAppendToManyRows failed")
  }
  //benchAppendToManyRows

  const jsCoverage = await jsCov.stopJSCov(page.coverage);
  await jsCov.parseJSCov(jsCoverage);
  await browser.close();
  server.close()
})();
/*
Execution format:
node pup_coverage/todoPup.js /input/directory/
Sample:
node pup_coverage/todoPup.js ../js-framework-benchmark/frameworks/keyed/vanillajs/index.html
*/

//run the following commands inside the framework you would like to test
//First run npm install
//Then run npm run build-prod