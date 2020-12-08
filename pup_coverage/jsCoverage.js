function startJSCov(page){
        return Promise.all([
                page.startJSCoverage()
              ]);
}

function stopJSCov(page){
        return Promise.all([
                page.stopJSCoverage(),
              ]);
}
function parseJSCov(jsCoverage){
        const js_coverage = [...jsCoverage];
        //Parse collected JS Coverage
        let cov = {};
        cnt = 0
        for (const entry of js_coverage[0]) {
          if (!(entry.url in cov)) {
            cov[entry.url] = {
              'js_total_bytes': 0,
              'js_used_bytes': 0
            }
          }
          cov[entry.url]['js_total_bytes'] = cov[entry.url]['js_total_bytes'] + entry.text.length;
      
          for (const range of entry.ranges) {
            cov[entry.url]['js_used_bytes'] = cov[entry.url]['js_used_bytes'] + range.end - range.start;
      
          }
      
        }
        for (entry in cov) {
          console.log(`Utilization percetages ${entry}: ${cov[entry]['js_used_bytes'] / cov[entry]['js_total_bytes'] * 100}%`);
        }
}
module.exports = { startJSCov, stopJSCov, parseJSCov };