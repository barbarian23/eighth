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

        await timer(2000);

        //đợi cho đến khi iframe load xong data - là iframe đã load xong

        await driver.waitForFunction('document.querySelector("#divIframe iframe") != null');

        //cách lấy value trong iframe , thực thi hàm sau
        // let iframe = document.querySelector("#divIframe iframe");
        // return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh");

        //lấy ra table result search - chỉ lấy phần row data

        writeToXcell(worksheet, line, 1, index, style);
        writeToXcell(worksheet, line, 2, numberPhone, style);
        let col = 2;
        col += 1;
        if (options.trangthaigoidi) {
            let trangthaigoidi = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDi").checked;' +
                '};' +
                'getE();');
            console.log("trangthaigoidi", trangthaigoidi);
            trangthaigoidi = trangthaigoidi == true ? "Mở" : "Đóng";
            writeToXcell(worksheet, line, col, trangthaigoidi, style);
            col += 1;
        }

        if (options.trangthaigoiden) {
            let trangthaigoiden = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_chkGoiDen").checked;' +
                '};' +
                'getE();');
            console.log("trangthaigoiden", trangthaigoiden);
            trangthaigoiden = trangthaigoiden == true ? "Mở" : "Đóng";
            writeToXcell(worksheet, line, col, trangthaigoiden, style);
            col += 1;
        }

        if (options.tenthuebao) {
            let tenthuebao = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTB").value;' +
                '};' +
                'getE();');
            console.log("tenthuebao", tenthuebao);
            writeToXcell(worksheet, line, col, tenthuebao, style);
            col += 1;
        }

        if (options.tinh) {
            let tinh = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTinh").value;' +
                '};' +
                'getE();');
            console.log("tinh", tinh);

            writeToXcell(worksheet, line, col, tinh, style);
            col += 1;
        }

        if (options.IMSI) {
            let IMSI = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtIMSI").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, IMSI, style);
            col += 1;
        }

        if (options.ngaysinh) {
            let ngaysinh = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNgaySinh").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, ngaysinh, style);
            col += 1;
        }

        if (options.sogt) {
            let sogt = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtSoGT").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, sogt, style);
            col += 1;
        }

        if (options.ngaycap) {
            let ngaycap = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtNoiCap").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, ngaycap, style);
            col += 1;
        }

        if (options.sopin) {
            let sopin = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, sopin, style);
            col += 1;
        }

        if (options.sopuk) {
            let sopuk = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, sopuk, style);
            col += 1;
        }

        if (options.sopin2) {
            let sopin2 = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPIN2").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, sopin2, style);
            col += 1;
        }

        if (options.sopuk2) {
            let sopuk2 = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtPUK2").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, sopuk2, style);
            col += 1;
        }

        if (options.dcthuongtru) {
            let dcthuongtru = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtDiaChiThuongTru").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, dcthuongtru, style);
            col += 1;
        }

        if (options.taikhoanchinh) {
            let taikhoanchinh = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtTKC").value;' +
                '};' +
                'getE();');

            writeToXcell(worksheet, line, col, taikhoanchinh, style);
            col += 1;
        }

        if (options.hansudung) {
            let hansudung = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtHSD").value;' +
                '};' +
                'getE();');
            writeToXcell(worksheet, line, col, hansudung, style);
            col += 1;
        }

        if (options.hanghoivien) {
            let hanghoivien = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'return iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_lblHangHoiVien").innerHTML;' +
                '};' +
                'getE();');

            console.log("hanghoivien", hanghoivien);
            writeToXcell(worksheet, line, col, hanghoivien, style);
            col += 1;
        }

        if (options.notruocdo) {
            let notruocdo = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let tA = iframe.contentWindow.document.querySelector("#tblThongTinCuocTraSau");' +
                'return tA == null ? "" : tA.innerHTML;' +
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
                writeToXcell(worksheet, line, col, no, style);

            } else {
                writeToXcell(worksheet, line, col, "Không có", style);
            }
            col += 1;

        }

        await timer(2000);
        //thuê bao tham gia khuyến mại cần đợi 1-2 giây

        if (options.tbttkm) {
            let tbttkm = await driver.evaluate('function getE(){' +
                'let iframe = document.querySelector("#divIframe iframe");' +
                'let tA = document.querySelector("#divIframe iframe");' +
                'return  tA == null ? "" : iframe.contentWindow.document.querySelector("#ctl00_ContentPlaceHolder1_txtKhuyenMai").value;' +
                '};' +
                'getE();');

            //bay dùng SON.stringify là chuẩn rồi
            //nhưng mà hiện tại hàm  bên trên tao viết lại vì web nó dùng iframe return về string nên không cần dùng JSON.stringify
            if (tbttkm != "") {
                writeToXcell(worksheet, line, col, tbttkm, style);
            } else {
                writeToXcell(worksheet, line, col, "Không có", style);
            }
            col += 1;
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
