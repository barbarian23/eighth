import socketServer from "../../service/socket/socket.server.service";
// import csvService from "../../service/csv/csv.server.service";
import {
    SOCKET_LOGIN,
    SOCKET_OTP,
    SOCKET_WORKING_START_CRAWL_DATA,
    SOCKET_CRAWLED_DONE,
    SOCKET_CRAWLED_PAUSE
} from "../../../common/constants/common.constants";
import doLogin from "../work/login.controller";
import doOTPChecking from "../work/otp.controller";
import doGetInfomation from "../work/home.controller";
import { forEach } from "lodash";

const puppeteer = require('puppeteer');
//C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe
//C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe
let exPath = "C:\\Program Files (x86\\Google\\Chrome\\Application\\chrome.exe";
var driver, browser;
var isStop = false;

//puppeteer
//socket
var socket = null;
var excel = require('excel4node');
var wb, ws;
var fileName;
var THRESLDHOLD = 50;
const MIN_TIME = 6000;
var line = 2;//bỏ qua header và excel bắt đầu từ một

const preparePuppteer = function () {
    return new Promise(async (res, rej) => {
        try {
            let browser = await puppeteer.launch({
                args: ["--no-sandbox", "--proxy-server='direct://'", '--proxy-bypass-list=*'],
                headless: true,
                ignoreHTTPSErrors: true,
                executablePath: exPath == "" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : exPath
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

            //pause
            receive.on(SOCKET_CRAWLED_PAUSE, doPause);
        });
    } catch (e) {
        console.error("loi puppteer hoac socket", e);

    }
}

//pause
const doPause = async function () {
    try {
        console.log("doPause", data.isStop);
        isStop = data.isStop;
    } catch (e) {
        console.log("doPause error ", e);
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
        //chekc xem line có bị undefined hay không
        line = line ? line : 2;
        let dOption = { ...data.data };
        for (let index = 0; index < data.listPhone.length; index++) {
            console.log("Tra cuu so thu ", index, " phone ", data.listPhone[index], "line", line);
            let today = new Date();
            //option nằm trong data.data

            if (isStop == true) {
                index--;
                console.log("tam dung");
                continue;
            }

            let tempLine = await doGetInfomation(line, data.listPhone[index].phone, data.listPhone[index].index, dOption, today.getFullYear() + '-' + (today.getMonth() + 1), ws, socket, driver, data.listPhone.length, style);
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

        ws.cell(1, 1).string("STT").style(style);
        ws.cell(1, 2).string("Số điện thoại").style(style);
        let col = 2;
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

        if (options.tieudung3thang) {
            //tháng đầu tiên
            ws.cell(1, col).string("Tháng dữ liệu 1").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng thoại 1").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng SMS 1").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng DATA 1").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng VAS 1").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng TKC 1").style(style);
            col += 1;


            //tháng thứ hai
            ws.cell(1, col).string("Tháng dữ liệu 2").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng thoại 2").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng SMS 2").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng DATA 2").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng VAS 2").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng TKC 2").style(style);
            col += 1;


            //tháng thứ ba
            ws.cell(1, col).string("Tháng dữ liệu 3").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng thoại 3").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng SMS 3").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng DATA 3").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng VAS 3").style(style);
            col += 1;
            ws.cell(1, col).string("Tổng TKC 3").style(style);
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

        writeHeader(wb, ws, data.data);
        let today = new Date();
        fileName = data.nameFile + "_" + "Ngay " + today.getDate() + " Thang " + (today.getMonth() + 1) + " Nam " + today.getFullYear() + "_" + today.getHours() + " Gio " + today.getMinutes() + " Phut-" + today.getTime() + ".xlsx";
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