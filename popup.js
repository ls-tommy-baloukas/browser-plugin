const SettingsCheck = () => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(function (result) {
      resolve(result)
    });
  })
}

SettingsCheck().then((result) => {
  if (result.UKVatReport.active) {
    $('#svg-box').append(
      `<svg class="circular green-stroke">
      <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
      </svg>
      <svg class="checkmark green-stroke">
          <g transform="matrix(0.79961,8.65821e-32,8.39584e-32,0.79961,-489.57,-205.679)">
              <path class="checkmark__check" fill="none" d="M616.306,283.025L634.087,300.805L673.361,261.53"/>
          </g>
      </svg>`
    )
    $('#status').text('Active')
  } else {
    $('#svg-box').append(
    `<svg class="circular yellow-stroke">
          <circle class="path" cx="75" cy="75" r="50" fill="none" stroke-width="5" stroke-miterlimit="10"/>
      </svg>
      <svg class="alert-sign yellow-stroke">
          <g transform="matrix(1,0,0,1,-615.516,-257.346)">
              <g transform="matrix(0.56541,-0.56541,0.56541,0.56541,93.7153,495.69)">
                  <path class="line" d="M634.087,300.805L673.361,261.53" fill="none"/>
              </g>
              <g transform="matrix(2.27612,-2.46519e-32,0,2.27612,-792.339,-404.147)">
                  <circle class="dot" cx="621.52" cy="316.126" r="1.318" />
              </g>
          </g>
      </svg>`
    )
    $('#status').text('Disabled')
  }
})

$('#ext_options').click((e)=> {
  e.preventDefault;
  chrome.runtime.openOptionsPage();
});

// $('#feedback').click((e)=> {
//   e.preventDefault;
//   chrome.tabs.create({url:'https://forms.gle/YjsVRmvndpCsy9Ti8'})
// });


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
ga('send', 'pageview', '/popup'); // Set page


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