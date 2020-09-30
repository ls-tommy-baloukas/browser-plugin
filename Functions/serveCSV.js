//@ts-check

//this is a var as declartion as a const prevents reports from running twice without refreshing the page
var serveCSV = async (reportName, dates) => {

    console.log("My report name sir is", reportName)

    const generateCSV = async (records, delimeter) => {
        return records.reduce((csv, currentLine, idx, fullDetail) => {
            const values = Object.values(currentLine).join(delimeter);
            if (idx === 0) {
                const headers = Object.keys(fullDetail[0]).join(delimeter);
                csv += `${headers}\n`
                return csv += `${values}\n`
            }
            const finalIndx = fullDetail.length - 1;
            if (idx === finalIndx) return csv += `${values}`
            return csv += `${values}\n`
        }, '');
    }
    const dateFormat = (dates) => dates.map(date => `${date}T00:00:00-0${new Date().getTimezoneOffset() / 60}:00`).join(',')

    const localizeDate = date => {
        const [currentDate, timestamp] = new Date(date).toLocaleString().split(',')
        return [currentDate.split(/\//g).reverse().join('-'), timestamp].join('T').replace(/\s+/g, "")
        }

    const filterJSON = (inclusionList, json) => Object.fromEntries(Object.entries(json).filter(field => inclusionList.includes(field[0])))

    if (dates == undefined) throw new Error("No date specified")
    if (dates.length !== 2) throw new Error("Please specify both a start date and an end date")

    const domain = window.location.host;

    const accountResponse = await fetch(`https://${domain}/API/Account.json`, {
        credentials: 'same-origin'
    });

    const {
        Account: {
            accountID
        }
    } = await accountResponse.json()

    let offset = 0;
    let nextPage = true;
    let results = [];

    while (nextPage) {

        const saleResponse = await fetch(`https://${domain}/API/Account/${accountID}/DisplayTemplate/Sale.json?&offset=${offset}&completed=true&completeTime=><,${dateFormat(dates)}`, {
            credentials: 'same-origin'
        });

        const salesResponseJSON = await saleResponse.json();

        if (salesResponseJSON.hasOwnProperty('Sale')) {
            Array.isArray(salesResponseJSON.Sale) ?
                results.push(...salesResponseJSON.Sale) :
                results.push(salesResponseJSON.Sale);

            offset += 100

        } else {
            nextPage = false;
        }
    }
    const saleRecords = results.reduce((processedSales, currentSale) => {

        const {
            completeTime,
            Shop: {
                name: shopName
            }
        } = currentSale;

        let rows;
        if (currentSale.SaleLines && currentSale.SalePayments) {
            const saleLines = Array.isArray(currentSale.SaleLines.SaleLine) ? currentSale.SaleLines.SaleLine : [currentSale.SaleLines.SaleLine];
            const salePayments = Array.isArray(currentSale.SalePayments.SalePayment) ? currentSale.SalePayments.SalePayment : [currentSale.SalePayments.SalePayment];

            rows = saleLines.reduce((dataStruct, currentrow) => {

                const {
                    itemID,
                    unitQuantity,
                    saleID,
                    discountID,
                    displayableUnitPrice,
                    displayableSubtotal,
                    tax1Rate,
                    calcTax1,
                    calcSubtotal,
                    calcTotal,
                    tax,
                    calcDiscount
                } = currentrow;

                const data = {
                    saleID: saleID,
                    shopName: shopName,
                    description: Number(itemID) > 0 ? currentrow.Item.description : currentrow.Note.note,
                    unitSold: unitQuantity,
                    subtotal: calcSubtotal,
                    //subtotalWithoutDiscount: Number(calcSubtotal) + Number(calcDiscount),
                    discount: discountID > 0 ? Number(displayableUnitPrice) - Number(displayableSubtotal) : 0,
                    vatRate: tax1Rate,
                    date: localizeDate(completeTime),
                    totalTax: calcTax1,
                    total: calcTotal,
                    paymentDate: localizeDate(salePayments[0].createTime),
                    isTaxed: tax
                }

                if (reportName == "Retail") {

                    const filteredReport = filterJSON(
                    [ "shopName", "saleID", "isTaxed",
                     "totalTax", "discount", "date", 
                     "total", "unitSold", "description"], data)


                    dataStruct.push(filteredReport)

                    return dataStruct
                }

                const filteredReport = filterJSON(
                    ["shopName", "isTaxed", "totalTax",
                    "discount", "total", "date", 
                    "paymentDate","vatRate", "subtotal"], data)
               
                dataStruct.push(filteredReport)
                return dataStruct

            }, []);
        } else {
            return processedSales
        }
        processedSales.push(...rows)
        return processedSales;
    }, []);


    const csv = await generateCSV(saleRecords, ";");

    //Close the modal occupying the screen once the report is generated
    Swal.close();
    const blob = new Blob([csv], {
        type: 'text/csv;charset=utf-8;'
    });
    const currentDate = `${new Date().toLocaleString().split(',').map(string => string.trim()).join('_').replace(/\//g, "-")}`
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `${reportName}-Accounting_${currentDate}`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    //Send Download event to Analytics
    const payload = {
        'eventCategory': `${reportName}-report`,
        'eventAction': 'Download Initiated - Chrome Extension',
        'eventLabel': `RAD ID: ${accountID}`,
    }
    window.postMessage({
        type: "ANALYTICS",
        text: "Let's run this script",
        "payload": payload
    }, "*");


}

//read the dates stored in local storage
//this is a var as declartion as a const prevents reports from running twice without refreshing the page
var SettingsCheck = () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(function (result) {
            resolve(result)
        });
    })
}

SettingsCheck().then((result) => {
    const {
        Report: {
            Report: reportName,
            dates
        }
    } = result
    //run the serveCSV function with the dates that are stored in local storage
    serveCSV(reportName, dates)

    //send Analytics report of report running
    let payload = {
        'eventCategory': `${reportName}-report`,
        'eventAction': 'Ran - Chrome Extension',
        'eventLabel': `RAD ID: ${$('#help_account_id').text()}`,
    }
    window.postMessage({
        type: "ANALYTICS",
        text: "Let's run this script",
        "payload": payload
    }, "*");

    //load a modal to show ui feedback that report is running
    let svgURL = chrome.runtime.getURL("svg-loaders/ball-triangle.svg");
    Swal.fire({
        imageUrl: svgURL,
        html: '<h3>Generating Report</h3>',
        //Forcing the merchant to await the report before proceeding...
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
    });
});