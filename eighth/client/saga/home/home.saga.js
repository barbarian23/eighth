import { takeLatest, take, put, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import { homeConstant } from "../../constants/home/home.constant";
import {
    START_CRAWL_DATA,
    GET_NUMBER_INFORMATION,
    GET_NUMBER_INFORMATION_SUCCESS,
    CRAWLED_PAUSE
} from "../../action/home/home.action";
import socketClient from "../../service/socket/socket.client.service";
import {
    SOCKET_WORKING_START_CRAWL_DATA,
    SOCKET_WORKING_CRAWLED_ITEM_DATA,
    MAIN_URL,
    SOCKET_CRAWLED_DONE,
    SOCKET_CRAWLED_PAUSE
} from "../../../common/constants/common.constants";
import { PortClient } from "../../service/util/port.client";

let SOCKET_URL =  PortClient.getInstance().getPort(); 

const socket = new socketClient(SOCKET_URL);

// sử dụng eventChannel để gửi và nhận data qua socket
// 
const startCrawlDataSocket = function (data) {
    console.log("startCrawlDataSocket", data.data);
    return eventChannel(emitter => {
        console.log("start send", { listPhone: data.data.listPhone, nameFile: data.data.nameFile, time: data.data.time, data: data.data });
        socket.send(SOCKET_WORKING_START_CRAWL_DATA, { listPhone: data.data.listPhone, nameFile: data.data.nameFile, time: data.data.time, data: data.data });
        socket.receive(SOCKET_WORKING_CRAWLED_ITEM_DATA, function (data) {
            console.log("crawl item home.saga from server", data);
            emitter(data || '');
        });
        socket.receive(SOCKET_CRAWLED_DONE, function (data) {
            console.log("crawl done", data);
            emitter(data || '');
        });
        return () => {
            // unscrible
        };
    });
}
// Nhận kết quả từ socket
const startCrawlData = function* (action) {
    //lay vee fkeest quar cuar event channel redux
    console.log("startCrawlData", action);
    let result = yield call(startCrawlDataSocket, action);
    yield put({
        type: GET_NUMBER_INFORMATION_SUCCESS,
        data: false,
    })
    // ket qua cua socket
    while (true) {
        let responce = yield take(result);
        if (responce) {
            if (responce.data == 2) { //CRAWL DONE
                yield put({
                    type: GET_NUMBER_INFORMATION_SUCCESS,
                    data: true,
                })
            } else {
                console.log("respone", responce);
                yield put({
                    type: GET_NUMBER_INFORMATION,
                    data: responce // responce bao gom: index & phone da duoc crawl success du data cua phone null hay khong
                })
            }
        }
    }

}

//pause function
const doPause = function* (data) {
    console.log("doPause", data);
    return eventChannel(
        (emitter) => {
            socket.send(SOCKET_CRAWLED_PAUSE, { isStop: data.data.isStop });

            return () => {

            }
        });
}

const startDoPause = function* startDoPause(action) {
    console.log("startDoPause", action);
    let result = yield call(doPause, action);

    // ket qua cua socket
    while (true) {
        let responce = yield take(result);
        if (responce) {
            console.log("doPause", action);
        }
    }
}

export const watchHome = function* () {
    yield takeLatest(START_CRAWL_DATA, startCrawlData);
    yield takeLatest(CRAWLED_PAUSE, startDoPause);
}