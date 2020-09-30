function trackButtonClick(e) {
    let payload = {
        'eventCategory': `${e.target.parentNode.name}-report`,
        'eventAction': 'Initiated - Chrome Extension',
        'eventLabel': `RAD ID: ${$('#help_account_id').text()}`,
    }
    window.postMessage({ type: "ANALYTICS", text: "Let's run this script", "payload":payload }, "*");
}

const listenForReportClicks = _ => {
    const reports = [...document.querySelectorAll('[data-type="report"]')];
    reports.forEach(report => report.addEventListener('click', trackButtonClick));
}


//Load the Sweet Alert 2 external dependency.
if ($('#swal2').length < 1) {
    let swal2 = chrome.runtime.getURL("Resources/sweetalert2.all.min.js");
    $('head').append(`<script type="text/javascript" id="swal2" src="${swal2}"></script>`);
}


//Adding the function to be used for the onClick events of the two new reports
if ($('#getDates').length < 1) {
    $('head').append(`<script type="text/javascript" id="getDates">
    async function getReportDates(report) {
        const {
            value: formValues
        } = await Swal.fire({
            title: ""+report+" Digital VAT Accounting Report",
            html: '<label for="start">Choose the start date</label><input type="date" name="start" id="swal-input1" class="swal2-input"><label for="end">Choose the end date </label><input type="date" name="end" id="swal-input2" class="swal2-input">',
            preConfirm: () => {
                return {
                    dates: [
                        $('#swal-input1').val(),
                        $('#swal-input2').val()
                    ],
                    Report: report
                }
            },
            confirmButtonText: 'Next &rarr;',
            showCancelButton: true,
        })
    
        if (formValues) {
            if(formValues.dates[0].length > 0 && formValues.dates[1].length >0) {
                window.postMessage({ type: "FROM_PAGE", text: "Let's run this script", value:formValues }, "*");
            } else {
                Swal.fire({
                    title:"Whoops!",
                    text:"Starting and ending dates are needed to generate the report",
                    icon: "warning",
                })
            } 
        } 
    }</script>`);
}

//Function to add the list items
const addListItems = () => {
    $('#reports_other_section').find('.action_group > ul')
        .append(`<li>
    <a href="javascript:;" onclick="getReportDates('Retail')" id="UKDigitalRetailVatReport" name="Retail" data-type="report"><span data-automation="buttonTitle">UK Digital Retail VAT Report</span>
    </a>
    <span class="explanation">Generate MDTfV UK Digital Retail VAT report</span>
    </li>
    `)
        .append(`<li>
    <a href="javascript:;" onclick="getReportDates('Normal')" id="UKDigitalNormalVatReport" name="Normal" data-type="report"><span data-automation="buttonTitle">UK Digital Normal VAT Report</span>
    </a>
    <span class="explanation">Generate MDTfV UK Digital Normal VAT report</span>
    </li>
    `);
}

//Mutation observers, cause Retail uses react, so we have to listen for changes in the DOM
var mutationObserver = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        //console.log(mutation);
        if ($('#UKDigitalRetailVatReport').length < 1 && $('#UKDigitalNormalVatReport').length < 1) {
            addListItems();
            listenForReportClicks();
        }
    });
});

//create the empty target variable
var targetNode = $('.reports')[0];

//configure the Mutation Observer
const observerConfig = {
    attributes: true,
    attributeOldValue: true,
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true,
    // attributeFilter: ['style']
};

//Wait until the target for mutations exists
var FindTarget = setInterval(function () {
    if (typeof (targetNode) == 'undefined') {
        targetNode = $('.reports')[0];
    } else {
        console.log("Taret Aquired!");
        mutationObserver.observe(targetNode, observerConfig);
        clearInterval(FindTarget);
        addListItems();
        listenForReportClicks();
    }
}, 200);
