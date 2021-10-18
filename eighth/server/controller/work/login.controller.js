import { LOGIN_URL, OTP_URL } from "../../constants/work/work.constants";
import { SOCKET_SOMETHING_ERROR, SOCKET_LOGIN_INCORRECT, SOCKET_LOGIN_STATUS } from "../../../common/constants/common.constants";

const DEFAULT_DELAY = 2000;

/**
 * 
 * @param {*} ms sleep đi 1 vài giây, đơn vị là milisecond
 */
function timer(ms) {
    ms = ms == null ? DEFAULT_DELAY : ms;
    return new Promise(res => setTimeout(res, ms));
}

// do login
async function doLogin(username, password, socket, driver, driver2) {
    try {
        console.log("username ", username, "password", password);
        // go to login url
        await driver.goto(LOGIN_URL);

        // wait to complete
        //await driver.waitForFunction('document.readyState === "complete"'); // need open comment

        // select to username input & send username
        // let selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_UserName"; // need open comment
        let selector = "#txtUsername";
        await driver.$eval(selector, (el, value) => el.value = value, username);

        // select to password input & send password
        // selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_Password";// need open comment
        selector = "#txtPassword";
        await driver.$eval(selector, (el, value) => el.value = value, password);

        // select to button login & click button
        // selector = "body #ctl01 .page .main .accountInfo #MainContent_LoginUser_LoginButton";// need open comment
        selector = "#btnLogin";
        await Promise.all([driver.click(selector), driver.waitForNavigation({ timeout: '61000' })]);

        await timer(2000);

        //lấy ra một DOM - tương đương hàm document.querySelector()
        // check trường hợp login wrong
        //khi mà alert sai password hiện lên

        // driver.on("dialog", async (dialog) => {
        //     console.log("alert login", dialog.message());
        //     await dialog.dismiss();
        //     socket.send(SOCKET_LOGIN_INCORRECT, { data: -1 });
        // });

        // let dataFromLoginSummarySpan = await driver.$$eval("body #ctl01 .page .main .failureNotification", spanData => spanData.map((span) => {
        //     return span.innerHTML;
        // }));

        // if (dataFromLoginSummarySpan.length > 0) {
        //     socket.send(SOCKET_LOGIN_INCORRECT, { data: -1 });
        //     return;
        // }
        //đi tới trang thông tin số
        //await driver.goto(OTP_URL);
        // wait to complete

        await driver.evaluate("setInterval(()=>{document.querySelector('#txtOtp')},500)");

        await driver.waitForFunction('document.querySelector("#txtOtp") != null');

        //await driver2.goto(OTP_URL);

        socket.send(SOCKET_LOGIN_STATUS, { data: 1 });

    } catch (e) {
        console.log("Login Error", e);
        socket.send(SOCKET_LOGIN_INCORRECT, { data: -1 });
        socket.send(SOCKET_SOMETHING_ERROR, { data: 0 });
    }
}
export default doLogin;
