'use strict';
$("input[type=checkbox]").click((e) => {
  console.log(e);
  var checked = e.currentTarget.checked;
  var parent = e.currentTarget.dirName;
  console.log(e.target.id, checked, parent);
  var update;
  console.log(e.target.id);
  chrome.storage.sync.get(parent, function (result) {
    update = result;
    update[parent][e.target.id] = checked;
    console.log('The setting was ' + result[parent][e.target.id]);
    chrome.storage.sync.set(update, function (result) {
      console.log('Value is set to ' + checked);
    });
  });

  chrome.storage.sync.get(parent[e.target.id], function (result) {
    console.log('The setting is now ' + result[parent][e.target.id]);
  });
});

$('.tabular.menu .item').tab();

function setState() {
  chrome.storage.sync.get(function (result) {
    $.each(result, function (index, setting) {
      $(`#${index}`).prop("checked", setting.active);
      $.each(setting, function (subindex, subsetting) {
        $(`#${subindex}`).prop("checked", subsetting);
      });
    });
  });
}
setState();

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
ga('send', 'pageview', '/options'); // Set page


function trackButtonClick(e) {
  ga('send', 'event', {
      'eventCategory': `${document.title}`,
      'eventAction': 'Click',
      'eventLabel': `${e.target.id}-Button`,
  });
}

function trackInputClick(e) {
  ga('send', 'event', {
      'eventCategory': `${document.title}`,
      'eventAction': 'Toggle',
      'eventLabel': `${e.target.dirName}-${e.target.id}-Setting`,
      'eventValue': e.target.checked ? 1 : 0,
  });
}

document.addEventListener('DOMContentLoaded', function () {
  var buttons = document.querySelectorAll('button');
  for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', trackButtonClick);
  }
  var inputs = document.querySelectorAll('input');
  for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('click', trackInputClick);
  }
});