import { HOME_URL } from "../../constants/work/work.constants";
import { SOCKET_WORKING_CRAWLED_ITEM_DATA } from "../../../common/constants/common.constants";
import { getListTdInformation, getTdInformation } from "../../service/util/utils.server";
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
        console.log("numberPhone ", numberPhone);
        // go to login url
        await driver.goto(HOME_URL);

        await driver.waitForFunction('document.readyState === "complete"');


        let selector = "#txtSoThueBao";
        await driver.$eval(selector, (el, value) => el.value = value, numberPhone);

        // select to button search & click button
        selector = "#btTraCuu"; // need to update
        await Promise.all([driver.click(selector)]);//, driver.waitForNavigation({ waitUntil: 'load', timeout: 0 })]);

        await timer(2000);


        //lấy ra table result search - chỉ lấy phần row data
        let col = 1;
        writeToXcell(worksheet, line, col, index, style);
        col += 1;
        if (options.trangthaigoidi) {
            writeToXcell(worksheet, line, col, "x", style);
            col += 1;
        }

        if (options.trangthaigoiden) {
            writeToXcell(worksheet, line, col, "x", style);
            col += 1;
        }

        if (options.tenthuebao) {
            let tenthuebao = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtTB", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, tenthuebao, style);
            col += 1;
        }

        if (options.tinh) {
            let tinh = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtTinh", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, tinh, style);
            col += 1;
        }

        if (options.IMSI) {
            let IMSI = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtIMSI", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, IMSI, style);
            col += 1;
        }

        if (options.ngaysinh) {
            let ngaysinh = await driver.$$eval("#ctl00$ContentPlaceHolder1$txtNgaySinh", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, ngaysinh, style);
            col += 1;
        }

        if (options.sogt) {
            let sogt = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtSoGT", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, sogt, style);
            col += 1;
        }

        if (options.ngaycap) {
            let ngaycap = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtNoiCap", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, ngaycap, style);
            col += 1;
        }

        if (options.sopin) {
            let sopin = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtPIN", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, sopin, style);
            col += 1;
        }

        if (options.sopuk) {
            let sopuk = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtPUK", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, sopuk, style);
            col += 1;
        }

        if (options.sopin2) {
            let sopin2 = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtPIN2", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, sopin2, style);
            col += 1;
        }

        if (options.sopuk2) {
            let sopuk2 = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtPUK2", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, sopuk2, style);
            col += 1;
        }

        if (options.dcthuongtru) {
            let dcthuongtru = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtDiaChiThuongTru", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, dcthuongtru, style);
            col += 1;
        }

        if (options.taikhoanchinh) {
            let taikhoanchinh = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtTKC", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, taikhoanchinh, style);
            col += 1;
        }

        if (options.hansudung) {
            let hansudung = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtHSD", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, hansudung, style);
            col += 1;
        }

        if (options.hanghoivien) {
            let hanghoivien = await driver.$$eval("#ctl00_ContentPlaceHolder1_lblHangHoiVien", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            writeToXcell(worksheet, line, col, hanghoivien, style);
            col += 1;
        }

        if (options.notruocdo) {
            let notruocdo = await driver.$$eval("#tblThongTinCuocTraSau", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            if (notruocdo != JSON.stringify([""])) {
                let listTdTag = getListTdInformation(resultHtml[0]);
                let no = getTdInformation(listTdTag[17]);
                writeToXcell(worksheet, line, col, no, style);
                col += 1;
            }
        }

        if (options.tbttkm) {
            let tbttkm = await driver.$$eval("#ctl00_ContentPlaceHolder1_txtKhuyenMai", spanData => spanData.map((span) => {
                return JSON.stringify(span.innerHTML);
            }));
            if (tbttkm != JSON.stringify([""])) {
                writeToXcell(worksheet, line, col, tbttkm, style);
                col += 1;
            }
        }

        // // gửi dữ liệu về client
        socket.send(SOCKET_WORKING_CRAWLED_ITEM_DATA, { index: index, phone: numberPhone });
        // clearInterval(itemPhone.interval);
        line++;
        return line;
    } catch (e) {
        console.log("doGetInfomation error ", e);
    }
}
export default doGetInfomation;
