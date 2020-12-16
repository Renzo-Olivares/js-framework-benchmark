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
  const clear = await waitForAnySelector(page, [
    "button[id='clear']",
  ])

  const run = await waitForAnySelector(page, [
    "button[id='run']",
  ])

  //benchAdd
  const add = await waitForAnySelector(page, [
    "button[id='add']",
  ])
  await page.click(add);
  // await page.click(clear) //clear
  //benchAdd

  //benchUpdate
  const update = await waitForAnySelector(page, [
    "button[id='update']",
  ]) 
  await page.click(run)
  await page.click(update)
  for (let i = 0; i < 10; i++) {
    await page.click(update)
  }
  // await page.click(clear) //clear
  //benchUpdate

  //benchSelect
  // await page.click(run)
  for (let i = 1; i < 100; i++) {
    const benchSelect = await page.$x(`//tbody/tr[${i}]/td[2]/a`)
    if(benchSelect.length > 0){
      await benchSelect[0].click()
    }
  }
  // await page.click(clear) //clear
  //benchSelect

  //benchSwapRows
  const swap = await waitForAnySelector(page, [
    "button[id='swaprows']",
  ]) 
  // await page.click(run)
  await page.click(swap)
  // await page.click(clear) //clear
  //benchSwapRows

  //benchRunBig
  const runlots = await waitForAnySelector(page, [
    "button[id='runlots']",
  ]) 
  await page.click(runlots)
  // await page.click(clear) //clear
  //benchRunBig

  //benchRemove
  // await page.click(run)
  for (let i = 1; i < 100; i++) {
    const benchRemove = await page.$x(`//tbody/tr[${i}]/td[3]/a/span[1]`)
    if(benchRemove.length > 0){
      await benchRemove[0].click()
    }
  }
  await page.click(clear) //clear
  //benchRemove

  // await page.waitFor(100000000);

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