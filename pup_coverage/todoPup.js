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

  //insertscript
  const clear = await waitForAnySelector(page, [
    "button[id='clear']",
  ])

  //benchRun
  const add = await waitForAnySelector(page, [
    "button[id='add']",
  ])

  await page.click(add);
  await page.waitForXPath("//tbody/tr[1000]/td[2]/a")
  const link = await page.$x("//tbody/tr[1000]/td[2]/a")
  if(link.length > 0){
    await link[0].click()
  }
  //benchRun

  await page.click(clear) //clear

  //benchReplaceAll
  const run = await waitForAnySelector(page, [
    "button[id='run']",
  ])

  await page.click(run);

  //insert xpath
  //benchReplaceAll

  await page.click(clear) //clear

  //benchUpdate
  const update = await waitForAnySelector(page, [
    "button[id='update']",
  ]) 

  await page.click(run)
  await page.click(update)
  //insert xpath
  //benchUpdate

  await page.click(clear) //clear

  //benchSelect

  //benchSelect

  await page.click(clear) //clear

  //benchSwapRows
  const swap = await waitForAnySelector(page, [
    "button[id='swaprows']",
  ]) 

  await page.click(run)
  await page.click(swap)
  //insert xPath
  //benchSwapRows

  await page.click(clear) //clear

  //benchRunBig
  const runlots = await waitForAnySelector(page, [
    "button[id='runlots']",
  ]) 

  await page.click(runlots)
  await page.waitForXPath("//tbody/tr[10000]/td[2]/a")
  const lots = await page.$x("//tbody/tr[10000]/td[2]/a")
  if(lots.length > 0){
    await lots[0].click()
  }
  //benchRunBig

  await page.click(clear) //clear

  //benchAppendToManyRows
  await page.click(run)
  await page.click(add)
  //benchAppendToManyRows

  await page.click(clear) //clear

  // await page.waitFor(100000000);

  const jsCoverage = await jsCov.stopJSCov(page.coverage);
  await jsCov.parseJSCov(jsCoverage);
  await browser.close();
  server.close()
})();
/*
Execution format:
node coverage/todoPup.js /input/directory/
Sample:
node coverage/todoPup.js ../js-framework-benchmark/frameworks/keyed/vanillajs/index.html
*/