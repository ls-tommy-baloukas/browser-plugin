'use strict';


//Analytics code
(function (i, s, o, g, r, a, m) {
  i['GoogleAnalyticsObject'] = r;
  i[r] = i[r] || function () {
      (i[r].q = i[r].q || []).push(arguments)
  }, i[r].l = 1 * new Date();
  a = s.createElement(o),
      m = s.getElementsByTagName(o)[0];
  a.async = 1;
  a.src = g;
  m.parentNode.insertBefore(a, m)
})(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');

ga('create', 'UA-152972033-3', 'auto');

// Modifications: 
ga('set', 'checkProtocolTask', null); // Disables file protocol checking.

const SettingsCheck = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(function (result) {
      resolve(result)
    });
  })
}

chrome.tabs.onUpdated.addListener(function (tabID, Changeinfo, tab) {
  if (Changeinfo.status == "complete") {
    SettingsCheck().then((result) => {
      var port = chrome.tabs.connect(tabID);
      port.postMessage({
        type: 'script',
        url: tab.url,
        settings: result,
        tabID: tabID,
      });

      port.onMessage.addListener(
        function (response) {
          console.log(response);
          if (typeof (response) == 'undefined') {
            console.log(`No response from Port:(`)
          } else {
            if (result.UKVatReport.active) {
              console.log(response)
              
              console.log(`Extended Reports are active!`)
              if (response.run && response.script == 'UKVatReport') {
                console.log('UKVatReport Run')
                chrome.tabs.executeScript(tabID, {
                  file: './Functions/UKVatReport.js',
                  runAt: 'document_idle',
                  allFrames: false,
                })
              }
              if (response.type == "FROM_PAGE") {
                chrome.storage.sync.set({
                  "Report":response.value
                }, function () {
                  console.log('Report Params Set!');
                  if(response.value.dates[0].length > 0 && response.value.dates[1].length > 0) {
                    chrome.tabs.executeScript(tabID, {
                      file: './Functions/serveCSV.js',
                      runAt: 'document_idle',
                      allFrames: false,
                    })

                  }
              });
              }
              if (response.type == "ANALYTICS") {
                ga('send', 'event', response.payload);
              }
            }
            if (!result.UKVatReport.active) {
              console.log('Extended Reports are off...')
            }
          }
        });
    })
  }
});

//Initialize the Extension
chrome.runtime.onInstalled.addListener(function () {
  chrome.storage.sync.set({
    "UKVatReport": {
      "active": true,
    },
  }, function () {
    console.log('Extension initialized!')
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [new chrome.declarativeContent.PageStateMatcher({
        //pageUrl: { hostEquals: '*' },
      })],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});
