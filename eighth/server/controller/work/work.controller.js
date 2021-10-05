import socketServer from "../../service/socket/socket.server.service";
// import csvService from "../../service/csv/csv.server.service";
import {
    SOCKET_LOGIN,
    SOCKET_OTP,
    SOCKET_WORKING_START_CRAWL_DATA,
    SOCKET_CRAWLED_DONE
} from "../../../common/constants/common.constants";
import doLogin from "../work/login.controller";
import doOTPChecking from "../work/otp.controller";
import doGetInfomation from "../work/home.controller";
import { forEach } from "lodash";

const puppeteer = require('puppeteer');
//C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
//C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
let exPath = "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe";
var driver, browser;

//puppeteer
//socket
var socket = null;
var excel = require('excel4node');
var wb, ws;
var fileName;
var THRESLDHOLD = 50;
const MIN_TIME = 2000;
var line = 2;//bỏ qua header và excel abwts đầu từ một

const preparePuppteer = function () {
    return new Promise(async (res, rej) => {
        try {
            let browser = await puppeteer.launch({
                args: ["--no-sandbox", "--proxy-server='direct://'", '--proxy-bypass-list=*'],
                headless: true,
                ignoreHTTPSErrors: true,
                executablePath: exPath == "" ? "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe" : exPath
            })

            // let pageLogin = await browser.newPage();
            // pageLogin.setViewport({ width: 2600, height: 3800 });

            res(browser);
        } catch (e) {
            rej(e);
        }
    });
}

const workingController = async function (server) {
    try {
        browser = await preparePuppteer();
        driver = await browser.newPage();
        driver.setViewport({ width: 2600, height: 3800 });

        //khoi tao socket 
        socket = socketServer(server);
        socket.receive((receive) => {
            //login
            receive.on(SOCKET_LOGIN, login);

            //otp
            receive.on(SOCKET_OTP, doOTP);

            //tra cứu số
            receive.on(SOCKET_WORKING_START_CRAWL_DATA, doGetInfor);
        });
    } catch (e) {
        console.error("loi puppteer hoac socket", e);

    }
}

//login
const login = async function (data) {
    try {
        console.log("login voi username va password", data.username, data.password);
        //let driver2 = await browser.newPage();
        doLogin(data.username, data.password, socket, driver, null); //driver 2 null
    } catch (e) {
        console.log("login error ", e);
    }
}

//otp
const doOTP = function (data) {
    try {
        console.log("Xac thuc voi OTP : ", data.otp);
        doOTPChecking(data.otp, socket, driver);
    } catch (e) {
        console.log("doOTP error ", e);
    }
}

// crawl data
const doGetInfor = async function (data) { // crawl data in table
    try {
        console.log("data from client: ", data);
        let mTime = data.time ? (data.time * 1000) : MIN_TIME;
        createFileExcel(data);
        let style = wb.createStyle({
            alignment: {
                vertical: ['center'],
                horizontal: ['center'],
                wrapText: true,
            },
            font: {
                name: 'Arial',
                color: '#4e3861',
                size: 12,
            },
        });
        for (let index = 0; index < data.listPhone.length; index++) {
            console.log("Tra cuu so thu ", index, " phone ", data.listPhone[index]);
            let today = new Date();
            let tempLine = await doGetInfomation(line, data.listPhone[index].phone, data.listPhone[index].index, data, today.getFullYear() + '-' + (today.getMonth() + 1), ws, socket, driver, data.listPhone.length, style);
            line = tempLine;
            await timer(mTime);
            //cứ 50 só một lần, ghi lại vào file excel
            if (index % THRESLDHOLD == 0) {
                await wb.write(fileName);
            }
        }
        await wb.write(fileName);
        socket.send(SOCKET_CRAWLED_DONE, { data: 2 });
        line = 2;
    } catch (e) {
        console.log("doGetInfor error ", e);
    }
}
// timer
function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
}
//// foreach
////prepare file xlsx to save data
//ghi ra từng ô
async function writeHeader(wb, ws, options) {
    try {
        let style = wb.createStyle({
            alignment: {
                vertical: ['center'],
                horizontal: ['center'],
                wrapText: true,
            },
            font: {
                bold: true,
                name: 'Arial',
                color: '#4e3861',
                size: 12,
            },
        });

        let col = 1;
        ws.cell(1, 1).string("STT").style(style);
        col += 1;
        if (options.trangthaigoidi) {
            ws.cell(1, col).string("Trạng thái gọi đi").style(style);
            col += 1;
        }

        if (options.trangthaigoiden) {
            ws.cell(1, col).string("Trạng thái gọi đến").style(style);
            col += 1;
        }

        if (options.tenthuebao) {
            ws.cell(1, col).string("Tên thuê bao").style(style);
            col += 1;
        }

        if (options.tinh) {
            ws.cell(1, col).string("Tỉnh").style(style);
            col += 1;
        }

        if (options.IMSI) {
            ws.cell(1, col).string("IMSI").style(style);
            col += 1;
        }

        if (options.ngaysinh) {
            ws.cell(1, col).string("Ngày sinh").style(style);
            col += 1;
        }

        if (options.sogt) {
            ws.cell(1, col).string("Số GT").style(style);
            col += 1;
        }

        if (options.ngaycap) {
            ws.cell(1, col).string("Ngày cấp").style(style);
            col += 1;
        }

        if (options.sopin) {
            ws.cell(1, col).string("Số PIN").style(style);
            col += 1;
        }

        if (options.sopuk) {
            ws.cell(1, col).string("Số PUK").style(style);
            col += 1;
        }

        if (options.sopin2) {
            ws.cell(1, col).string("Số PIN2").style(style);
            col += 1;
        }

        if (options.sopuk2) {
            ws.cell(1, col).string("Số PUK2").style(style);
            col += 1;
        }

        if (options.dcthuongtru) {
            ws.cell(1, col).string("Địa chỉ thường trú").style(style);
            col += 1;
        }

        if (options.taikhoanchinh) {
            ws.cell(1, col).string("Tài khoản chính").style(style);
            col += 1;
        }

        if (options.hansudung) {
            ws.cell(1, col).string("Hạn sử dụng").style(style);
            col += 1;
        }

        if (options.hanghoivien) {
            ws.cell(1, col).string("Hạng hội viên").style(style);
            col += 1;
        }

        if (options.notruocdo) {
            ws.cell(1, col).string("Nợ trước đó").style(style);
            col += 1;
        }

        if (options.tbttkm) {
            ws.cell(1, col).string("TBTT được TGKM").style(style);
            col += 1;
        }
    } catch (e) {
        console.log("e", e);
    }
}

const createFileExcel = function (data) {
    try {
        console.log(" file name from client", data.nameFile);

        wb = new excel.Workbook();
        ws = wb.addWorksheet('Tra cứu');

        ws.column(1).setWidth(5);//STT
        ws.column(2).setWidth(30);//Số thuê bao,
        ws.column(3).setWidth(30);//BTS_NAME,
        ws.column(4).setWidth(30);//MA_TINH,
        ws.column(5).setWidth(30);//TOTAL_TKC

        writeHeader(wb, ws, data);
        let today = new Date();
        fileName = data.nameFile + "_" + "Ngay " + today.getDate() + " Thang " + (today.getMonth() + 1) + " Nam " + today.getFullYear() + "_" + today.getHours() + " Gio " + today.getMinutes() + " Phut.xlsx";
        wb.write(fileName);

    } catch (e) {
        console.log("createFileExcel error ", e);
    }
}
////////////////////////


let random = () => {
    let rd = Math.floor(Math.random() * 10);
    console.log("number random", rd);
    return rd;
}

export default workingController;