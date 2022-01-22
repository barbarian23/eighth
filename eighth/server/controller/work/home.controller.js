import { HOME_URL } from "../../constants/work/work.constants";
import { SOCKET_WORKING_CRAWLED_ITEM_DATA } from "../../../common/constants/common.constants";
import { getListTdInformation, getTdInformation, getNumberInScript } from "../../service/util/utils.server";
const DEFAULT_DELAY = 2000;

/**
 * 
 * @param {*} ms sleep đi 1 vài giây, đơn vị là milisecond
 */
function timer(ms) {
    ms = ms == null ? DEFAULT_DELAY : ms;
    return new Promise(res => setTimeout(res, ms));
}
//ghi ra từng ô trong excel
async function writeToXcell(worksheet, x, y, title, style) {
    try {
        worksheet.cell(x, y).string(title + "").style(style);
    } catch (e) {
        console.log("e", e);
    }
    // }
}
// do login
async function doGetInfomation(line, numberPhone, index, options, month, worksheet, socket, driver, length, style) {
    try {

        //khi mà alert  hiện lên
        driver.on("dialog", async (dialog) => {
            console.log("alert home", dialog.message());
            await dialog.dismiss();
        });

        console.log("numberPhone ", numberPhone, "line", line);
        console.log("options ", options);
        // go to login url
        await driver.goto(HOME_URL);

        await driver.waitForFunction('document.readyState === "complete"');

        await driver.waitForFunction('document.querySelector("#txtSoThueBao") != null');

        let checktt = await driver.evaluate('document.querySelector("#txtSoThueBao")');

        console.log("checktt", checktt);

        let selector = "#txtSoThueBao";
        await driver.$eval(selector, (el, value) => el.value = value, numberPhone);

        // select to button search & click button
        selector = "#btTraCuu"; // need to update
        await Promise.all([driver.click(selector)]);//, driver.waitForNavigation({ timeout: '61000' })

        await timer(200);

        //khi bấm tra cứu, trang web cũng load lại nên cần đợi ready state
        await driver.waitForFunction('document.readyState === "complete"');

        await timer(500);

        //đợi cho đến khi iframe load xong data - là iframe đã load xong

        //await driver.waitForFunction('document.querySelector("#divIframe iframe").contentWindow.document.readyState == "complete"');

        await driver.evaluate('async function getE(){' +
            'return new Promise(async (res)=>{' +
            'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
            'let iframe = document.querySelector("#divIframe iframe");' +
            'let rTry = 0;' +
            'while(iframe == null && rTry < 27){' +
            'await timer(200);' +
            'iframe = document.querySelector("#divIframe iframe");' +
            'rTry++;' +
            '}' +
            'let doM = iframe.contentWindow.document.readyState;' +
            'rTry = 0;' +
            'while(doM != "complete" && rTry < 27){' +
            'await timer(200);' +
            'doM = iframe.contentWindow.document.readyState;' +
            'rTry++;' +
            '}' +
            'res(1);' +
            '});' +
            '};' +
            'getE();');
        console.log("iframe readyState is complete");
        //cách lấy value trong iframe , thực thi hàm sau
        // let iframe = document.querySelector("#divIframe iframe");
        // return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh");

        let checkContentWindow = await driver.evaluate('function getE(){' +
            'let iframe = document.querySelector("#divIframe iframe");' +
            'return iframe ? iframe : null' +
            '};' +
            'getE();');

        if(!checkContentWindow){
            line++;
            return line;
        }
        //đợi cho thanh laoding load xong -> sẽ trở về trang thái display = none
        let loadingIndicate = await driver.evaluate('function getE(){' +
            'let iframe = document.querySelector("#divIframe iframe");' +
            'return iframe.contentWindow.document.querySelector("#divLoading") ? iframe.contentWindow.document.querySelector("#divLoading").style.display : "none"' +
            '};' +
            'getE();');

        console.log("iframe loadingIndicate display", loadingIndicate);
        while (loadingIndicate != 'none') {
            loadingIndicate = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#divLoading") ? iframe.contentWindow.document.querySelector("#divLoading").style.display : "none"' +
                '};' +
                'getE();');
        }

        console.log("iframe loadingIndicate display is none");
        //lấy ra table result search - chỉ lấy phần row data

        writeToXcell(worksheet, line, 1, index, style);
        writeToXcell(worksheet, line, 2, numberPhone, style);
        let col = 2;
        col += 1;
        if (options.trangthaigoidi) {
            //checkbox thì không biết bắt event fill như nào => await 200 ms
            let trangthaigoidi = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDi");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(500);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDi");' +
                'rTry++;' +
                '}' +
                // 'await timer(200);' +

                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryyc = 0;' +
                'while(doM.checked == false && rTryyc < 11){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDi");' +
                'rTryyc++;' +
                '}' +

                'res(doM ? doM.checked : "");' +
                '});' +
                '};' +
                'getE();');
            console.log("trangthaigoidi", trangthaigoidi);
            trangthaigoidi = trangthaigoidi == true ? "Mở" : "Đóng";
            writeToXcell(worksheet, line, col, trangthaigoidi, style);
            col += 1;
        }

        if (options.trangthaigoiden) {
            let trangthaigoiden = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDen");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDen");' +
                'rTry++;' +
                '}' +
                //'await timer(500);' +

                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryyc = 0;' +
                'while(doM.checked == false && rTryyc < 11){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDen");' +
                'rTryyc++;' +
                '}' +

                'res(doM ? doM.checked : "");' +
                '});' +
                '};' +
                'getE();');
            console.log("trangthaigoiden", trangthaigoiden);
            trangthaigoiden = trangthaigoiden == true ? "Mở" : "Đóng";
            writeToXcell(worksheet, line, col, trangthaigoiden, style);
            col += 1;
        }

        if (options.tenthuebao) {
            let tenthuebao = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTB");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTB");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTB");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("tenthuebao", tenthuebao, tenthuebao == "", tenthuebao == null);
            writeToXcell(worksheet, line, col, tenthuebao, style);
            col += 1;
        }

        if (options.tinh) {
            let tinh = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh");' +
                'rTryy++;' +
                '}' +
                 'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("tinh", tinh);

            writeToXcell(worksheet, line, col, tinh, style);
            col += 1;
        }

        if (options.IMSI) {
            let IMSI = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtIMSI");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtIMSI");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtIMSI");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("IMSI", IMSI);

            writeToXcell(worksheet, line, col, IMSI, style);
            col += 1;
        }

        if (options.ngaysinh) {
            let ngaysinh = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNgaySinh");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNgaySinh");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNgaySinh");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("ngaysinh", ngaysinh);

            writeToXcell(worksheet, line, col, ngaysinh, style);
            col += 1;
        }

        if (options.sogt) {
            let sogt = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoGT");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoGT");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoGT");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("sogt", sogt);

            writeToXcell(worksheet, line, col, sogt, style);
            col += 1;
        }

        if (options.ngaycap) {
            let ngaycap = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNoiCap");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNoiCap");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNoiCap");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("ngaycap", ngaycap);

            writeToXcell(worksheet, line, col, ngaycap, style);
            col += 1;
        }

        if (options.sopin) {
            let sopin = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("sopin2", sopin);

            writeToXcell(worksheet, line, col, sopin, style);
            col += 1;
        }

        if (options.sopuk) {
            let sopuk = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("sopin2", sopuk);

            writeToXcell(worksheet, line, col, sopuk, style);
            col += 1;
        }

        if (options.sopin2) {
            let sopin2 = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN2");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN2");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN2");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("sopin2", sopin2);

            writeToXcell(worksheet, line, col, sopin2, style);
            col += 1;
        }

        if (options.sopuk2) {
            let sopuk2 = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK2");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK2");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK2");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("sopuk2", sopuk2);

            writeToXcell(worksheet, line, col, sopuk2, style);
            col += 1;
        }

        if (options.dcthuongtru) {
            let dcthuongtru = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtDiaChiThuongTru");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtDiaChiThuongTru");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtDiaChiThuongTru");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("dcthuongtru", dcthuongtru);

            writeToXcell(worksheet, line, col, dcthuongtru, style);
            col += 1;
        }

        if (options.taikhoanchinh) {
            let taikhoanchinh = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTKC");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTKC");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTKC");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');

            console.log("taikhoanchinh", taikhoanchinh);
            writeToXcell(worksheet, line, col, taikhoanchinh, style);
            col += 1;
        }

        if (options.hansudung) {
            let hansudung = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtHSD");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtHSD");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtHSD");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("hansudung", hansudung);
            writeToXcell(worksheet, line, col, hansudung, style);
            col += 1;
        }

        if (options.hanghoivien) {
            let hanghoivien = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_lblHangHoiVien");' +
                'let rank=null;' +
                'let rTry = 0;' +
                'while(!rank && rTry < 10){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_lblHangHoiVien");' +
                'if(doM){' +
                'if(doM.innerHTML != "..." && doM.innerHTML != ""){' +
                'rank=doM.innerHTML;' +
                '}' +
                '}' +
                'rTry++;' +
                '}' +
                'res(rank ? rank : "");' +
                '});' +
                '};' +
                'getE();');

            console.log("hanghoivien", hanghoivien);
            writeToXcell(worksheet, line, col, hanghoivien, style);
            col += 1;
        }

        if (options.notruocdo) {
            let notruocdo = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#tblThongTinCuocTraSau");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#tblThongTinCuocTraSau");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("");' +
                '}' +
                'res(doM ? doM.innerHTML : "");' +
                '});' +
                '};' +
                'getE();');

            //bay dùng JSON.stringify là chuẩn rồi
            //nhưng mà hiện tại hàm  bên trên tao viết lại vì web nó dùng iframe return về string nên không cần dùng JSON.stringify
            // if (notruocdo != JSON.stringify([""])) {
            //     let listTdTag = getListTdInformation(notruocdo[0]);
            //     let no = getTdInformation(listTdTag[17]);
            //     writeToXcell(worksheet, line, col, no, style);
            //     col += 1;
            // }

            if (notruocdo != "") {
                let listTdTag = getListTdInformation(notruocdo);
                let no = getTdInformation(listTdTag[17]);
                console.log("notruocdo", no);
                writeToXcell(worksheet, line, col, no, style);

            } else {
                writeToXcell(worksheet, line, col, "Không có", style);
            }
            col += 1;

        }

        //await timer(2000);
        //thuê bao tham gia khuyến mại cần đợi 1-2 giây

        if (options.tbttkm) {
            let tbttkm = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtKhuyenMai");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtKhuyenMai");' +
                'rTry++;' +
                '}' +
                'if(doM == null){' +
                'res("")' +
                '}' +
                'let rTryy = 0;' +
                'while(doM.value == "" && rTryy < 15){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtKhuyenMai");' +
                'rTryy++;' +
                '}' +
                'res(doM.value);' +
                '});' +
                '};' +
                'getE();');
            console.log("tbttkm", tbttkm);
            //bay dùng SON.stringify là chuẩn rồi
            //nhưng mà hiện tại hàm  bên trên tao viết lại vì web nó dùng iframe return về string nên không cần dùng JSON.stringify
            if (tbttkm != "") {
                writeToXcell(worksheet, line, col, tbttkm, style);
            } else {
                writeToXcell(worksheet, line, col, "Không có", style);
            }
            col += 1;
        }

        if (options.tieudung3thang) {
            let link3thang = await driver.evaluate('async function getE(){' +
                'return new Promise(async (res)=>{' +
                'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let doM = iframe.contentWindow.document.querySelector("html body form#aspnetForm div.contain_popup div.p8 div#myScollbar div.title_containpopup div#menu.margint10.round-border div.activemenu.flyout.hidden div.surrounded div.boxmnr div.p10 div#CCBS.hiddencontent ul.items_menu_pagepopup li:nth-child(28)");' +
                'let rTry = 0;' +
                'while(!doM && rTry < 27){' +
                'await timer(200);' +
                'doM = iframe.contentWindow.document.querySelector("html body form#aspnetForm div.contain_popup div.p8 div#myScollbar div.title_containpopup div#menu.margint10.round-border div.activemenu.flyout.hidden div.surrounded div.boxmnr div.p10 div#CCBS.hiddencontent ul.items_menu_pagepopup li:nth-child(28)");' +
                'rTry++;' +
                '}' +
                'res(doM ? doM.innerHTML : "");' +
                '});' +
                '};' +
                'getE();');

            console.log("link3thang", link3thang);
            //
            //document.querySelector("#divIframe iframe").contentWindow.document.querySelector("html body form#aspnetForm div.contain_popup div.p8 div#myScollbar div.title_containpopup div#menu.margint10.round-border div.activemenu.flyout.hidden div.surrounded div.boxmnr div.p10 div#CCBS.hiddencontent ul.items_menu_pagepopup li:nth-child(28) a")
            let regex = /TraCuuLSTieuDung\.aspx\?[^']*/g;
            link3thang = link3thang.match(regex);

            console.log("link3thang", link3thang);

            //=============================================================================
            //console.log("all",letLog);

            //=============================================================================
            if (link3thang && link3thang[0]) {

                await driver.evaluate('function getE(){' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'if(iframe){' +
                    'iframe.src="' + link3thang[0] + '";' +
                    '}};' +
                    'getE();');


                await timer(500);

                //đợi cho đến khi iframe load xong data - là iframe đã load xong
                //await driver.waitForFunction('document.querySelector("#divIframe iframe").contentWindow.document.readyState == "complete"');

                let link3thangREadyState = await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let rTry = 0;' +
                    'while(iframe == null && rTry < 27){' +
                    'await timer(200);' +
                    'iframe = document.querySelector("#divIframe iframe");' +
                    'rTry++;' +
                    '}' +
                    'let doM = iframe.contentWindow.document.readyState;' +
                    'rTry = 0;' +
                    'while(doM != "complete" && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.readyState;' +
                    'rTry++;' +
                    '}' +
                    'res(doM);' +
                    '});' +
                    '};' +
                    'getE();');

                console.log("link3thang iframe readystate", link3thangREadyState);

                //ddowij cho ddeesn khi load duoc trang moi

                // await driver.evaluate('async function getE(){' +
                //     'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                //     'let iframe = document.querySelector("#divIframe iframe");' +
                //     'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoThueBao");' +
                //     'let rTry = 0;' +
                //     'while(!doM && rTry < 27){' +
                //     'await timer(200);' +
                //     'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoThueBao");' +
                //     'rTry++;' +
                //     '}' +
                //     'if(doM){' +
                //     'doM.value = ' + numberPhone + ';' +
                //     '}' +
                //     'res(doM.value);' +
                //     '});' +
                //     '};' +
                //     'getE();');

                    console.log("link 3 thang fill in phone");
                // let link3thangHTML = await driver.evaluate('function getE(){' +
                //     'let iframe = document.querySelector("#divIframe iframe");' +
                //     'return iframe.contentWindow.document.querySelector("body").innerHTML;' +
                //     '};' +
                //     'getE();');
                // console.log("link3thangHTML", link3thangHTML);


                await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let rTry = 0;' +
                    'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_ddlFromThangNam");' +
                    'while(!doM && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_ddlFromThangNam");' +
                    'rTry++;' +
                    '}' +
                    'await timer(500);' +
                    'rTry = 0;' +
                    'let selectCheck = false;' +
                    'while(selectCheck == false && rTry < 27){' +
                    'await timer(200);' +
                    'if(doM){' +
                    'console.log("doM.selectedIndex",doM.selectedIndex);' +
                    'if(doM.selectedIndex != 3){' +
                    'doM.selectedIndex = 3;' +
                    '}else{' +
                    'selectCheck = true;' +
                    '}' +
                    '}' +
                    'rTry++;' +
                    '}' +
                    'res(doM ? doM.selectedIndex : "");' +
                    '});' +
                    '};' +
                    'getE();');

               
                    console.log("link 3 select thang");

                //document.querySelector("#divIframe iframe").contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_btFind").click();
                await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_btFind");' +
                    'let rTry = 0;' +
                    'while(!doM && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_btFind");' +
                    'rTry++;' +
                    '}' +
                    'if(doM){' +
                    'console.log("click");' +
                    'doM.click();' +
                    '};' +
                    'res(1);' +
                    '});' +
                    '};' +
                    'getE();');

                    console.log("link 3 click button");
                await timer(200);
                //await driver.waitForFunction('document.querySelector("#divIframe iframe").contentWindow.document.readyState == "complete"');

                await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let rTry = 0;' +
                    'while(iframe == null && rTry < 27){' +
                    'await timer(200);' +
                    'iframe = document.querySelector("#divIframe iframe");' +
                    'rTry++;' +
                    '}' +
                    'let doM = iframe.contentWindow.document.readyState;' +
                    'rTry = 0;' +
                    'while(doM != "complete" && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.readyState;' +
                    'rTry++;' +
                    '}' +
                    'res(1);' +
                    '});' +
                    '};' +
                    'getE();');

                //await driver.waitForFunction('document.querySelector("#divIframe iframe").contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_UpdateProgress1").style.display == "none"');
                await timer(200);
                console.log("tiedung3thang iframe readystate is complete");
                let getIndicate = await driver.evaluate('function getE(){' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_UpdateProgress1") ? iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_UpdateProgress1").style.display : ""' +
                    '};' +
                    'getE();');

                console.log("getIndicate", getIndicate);
                while (getIndicate != 'none') {
                    //console.log("getIndicate", getIndicate);
                    getIndicate = await driver.evaluate('function getE(){' +
                        'let iframe = document.querySelector("#divIframe iframe");' +
                        'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_UpdateProgress1") ? iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_UpdateProgress1").style.display : ""' +
                        '};' +
                        'getE();');
                    //console.log("getIndicate", getIndicate);
                }

                console.log("tiedung3thangiframe getIndicate", getIndicate);

                //đợi cho đến khi iframe load xong data - là iframe đã load xong
                //await driver.waitForFunction('document.querySelector("#divIframe iframe").contentWindow.document.readyState == "complete"');

                await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let rTry = 0;' +
                    'while(iframe == null && rTry < 27){' +
                    'await timer(200);' +
                    'iframe = document.querySelector("#divIframe iframe");' +
                    'rTry++;' +
                    '}' +
                    'let doM = iframe.contentWindow.document.readyState;' +
                    'rTry = 0;' +
                    'while(doM != "complete" && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.readyState;' +
                    'rTry++;' +
                    '}' +
                    'res(1);' +
                    '});' +
                    '};' +
                    'getE();');

                console.log("tiedung3thangiframe readyState is complete");
                //document.querySelector("#divIframe iframe").contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_GrvDatas").innerHTML

                let tieudung3thang = await driver.evaluate('async function getE(){' +
                    'return new Promise(async (res)=>{' +
                    'function timer(ms){return new Promise((res)=>setTimeout(res,ms))};' +
                    'let iframe = document.querySelector("#divIframe iframe");' +
                    'let doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_GrvDatas");' +
                    'let rTry = 0;' +
                    'while(!doM && rTry < 27){' +
                    'await timer(200);' +
                    'doM = iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_GrvDatas");' +
                    'rTry++;' +
                    '}' +
                    'if(!doM){' + //trường hợp mạng lỗi
                    'res("");' +
                    '}' +
                    'let regex = /[<td][^>]+>[^<]+<' + '\\' + '\/' + 'td>/g;' +
                    'rTry = 0;' +
                    'if(doM.innerHTML){'+
                    'doM = doM.innerHTML.match(regex);' +
                    '}'+
                    'while(doM.length < 26 && rTry < 27){' +
                    'await timer(200);' +
                    'if(doM.innerHTML){'+
                    'doM = doM.innerHTML.match(regex);' +
                    '}'+
                    'rTry++;' +
                    '}' +
                    'res(doM);' +
                    '});' +
                    '};' +
                    'getE();');

                // regex = /[<td][^>]+>[^<]+<\/td>/g;
                // let tieudung3thang = listtieudung3thang.match(regex);

                console.log("tieudung3thang 1", tieudung3thang.length);
                // console.log("tieudung3thang 1", tieudung3thang[1],tieudung3thang[3],tieudung3thang[4],tieudung3thang[5],tieudung3thang[6],tieudung3thang[9]);
                // console.log("tieudung3thang 2", tieudung3thang[14],tieudung3thang[16],tieudung3thang[17],tieudung3thang[18],tieudung3thang[19],tieudung3thang[22]);
                // console.log("tieudung3thang 3", tieudung3thang[27],tieudung3thang[29],tieudung3thang[30],tieudung3thang[31],tieudung3thang[32],tieudung3thang[35]);

                //tháng đầu tiên
                //1 3 4 5 6 9
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[1]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[3]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[4]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[5]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[6]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[9]), style);
                col += 1;

                //tháng thứ hai
                //14 16 17 18 19 22
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[14]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[16]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[17]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[18]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[19]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[22]), style);
                col += 1;


                //tháng thứ ba
                //27 29 30 31 32 35
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[27]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[29]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[30]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[31]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[32]), style);
                col += 1;
                await writeToXcell(worksheet, line, col, getNumberInScript(tieudung3thang[35]), style);
                col += 1;
            }
        }



        // // gửi dữ liệu về client
        socket.send(SOCKET_WORKING_CRAWLED_ITEM_DATA, { index: index, phone: numberPhone });
        // clearInterval(itemPhone.interval);
        line++;
        console.log("line after", line);
        return line;
    } catch (e) {
        console.log("doGetInfomation error ", e);
        line++;
        return line;
    }
}
export default doGetInfomation;
