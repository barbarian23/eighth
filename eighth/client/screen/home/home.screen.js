import React, { useState, useEffect } from "react";
import '../../assets/css/home/home.css';
import '../../assets/css/home/home.style.css';
import { TR_TYPE_SETUP, TR_TYPE_TIME, BUTTON_CRAWL_PAUSE, BUTTON_CRAWL_CONTINUE } from "../../constants/home/home.constant";
import { GET_LENGHT_LIST, START_CRAWL_DATA, SET_LIST_PHONE, CRAWLED_PAUSE } from "../../action/home/home.action";
import { readFileExcel } from "../../service/excel/excel.client.service";
import { useSelector, useDispatch } from 'react-redux';
import '../../assets/css/home/rc-checkbox.css';

export default function Home() {
    const [mTime, setMTime] = useState(6);
    const [isTracking, setIsTracking] = useState(false);
    const [nameFile, setNameFile] = useState("");
    const [onBoarding, setOnBoarding] = useState(false);
    const [chooseFile, setChooseFile] = useState(false);

    const [isStop, setisStop] = useState(false);

    const [trangthaigoidi, settrangthaigoidi] = useState(true);
    const [trangthaigoiden, settrangthaigoiden] = useState(true);
    const [tenthuebao, settenthuebao] = useState(true);
    const [tinh, settinh] = useState(true);
    const [IMSI, setIMSI] = useState(true);
    const [ngaysinh, setngaysinh] = useState(true);
    const [sogt, setsogt] = useState(true);
    const [ngaycap, setngaycap] = useState(true);
    const [sopin, setsopin] = useState(true);
    const [sopuk, setsopuk] = useState(true);
    const [sopin2, setsopin2] = useState(true);
    const [sopuk2, setsopuk2] = useState(true);
    const [dcthuongtru, setdcthuongtru] = useState(true);
    const [taikhoanchinh, settaikhoanchinh] = useState(true);
    const [hansudung, sethansudung] = useState(true);
    const [hanghoivien, sethanghoivien] = useState(true);
    const [notruocdo, setnotruocdo] = useState(true);
    const [tbttkm, settbttkm] = useState(true);
    const [tieudung3thang, settieudung3thang] = useState(true);
    const [warning, setWarning] = useState(false);

    const dispatch = useDispatch();
    let listPhone = useSelector(state => state.home.listPhone);
    let phoneNumberChecking = useSelector(state => state.home.phoneNumberChecking);
    let sumIndex = useSelector(state => state.home.sumIndex);
    let isCrawlDone = useSelector(state => state.home.isCrawlDone);

    useEffect(() => {
        setIsTracking(!isCrawlDone);
    }, [isCrawlDone]);

    let readFile = (e) => {
        // console.log("name file is ", e.target.files[0].name);
        console.log("read file")
        let nameFile = e.target.files[0].name;
        setNameFile(nameFile);
        setChooseFile(true);
        let tlistPhone = [];
        readFileExcel(e.target.files[0], (data) => {
            //data l?? m???ng ch???a danh s??ch thu?? bao v?? s??? ti???n
            dispatch({ type: GET_LENGHT_LIST, data: { sumIndex: data.length } });
            data.forEach((item, index) => {
                //B??? qua d??ng ?????u v?? l?? ti??u ?????
                if (index > 0) {
                    // console.log("data in file excel", item);
                    // dispatch({ type: SEND_NUMBER_TOSERVER, data: { phone: item[0], index: item[1] } });
                    let itemPhone = {
                        index: index,
                        phone: item[0]
                    }
                    tlistPhone.push(itemPhone);
                }
                if (index == (data.length - 1)) {
                    console.log("data - endoflist", item[0], " ", item[1], " listPhone", tlistPhone.length);
                    //pay qu??n ch??a ?????y list phone v??o reducer, n??n l???n ?????u khi b???m tra c???u th?? danh s??ch ;l??t phone b??? r???ng
                    dispatch({ type: SET_LIST_PHONE, data: { listPhone: tlistPhone } });
                    return;
                }
            });
        });

        //ph???i c???n d??ng d?????i, v?? n???u nh?? l???n th??? hai ch???n c??ng 1 file, s??? kh??ng ???????c t??nh l?? opnchange, h??m onchange s??? kh??ng g???i l???i
        e.target.value = null;
    }

    let onInputTime = (e) => {
        setMTime(e.target.value);
    }

    let sendDataToServer = () => {
        console.log(trangthaigoiden);
        console.log(trangthaigoidi);
        if (trangthaigoiden || trangthaigoidi) {
            setIsTracking(true);
            dispatch({
                type: START_CRAWL_DATA, data: {
                    listPhone: listPhone,
                    nameFile: nameFile.substring(0, nameFile.length - 5),
                    time: mTime,
                    trangthaigoidi: trangthaigoidi,
                    trangthaigoiden: trangthaigoiden,
                    tenthuebao: tenthuebao,
                    tinh: tinh,
                    IMSI: IMSI,
                    ngaysinh: ngaysinh,
                    sogt: sogt,
                    ngaycap: ngaycap,
                    sopin: sopin,
                    sopuk: sopuk,
                    sopin2: sopin2,
                    sopuk2: sopuk2,
                    dcthuongtru: dcthuongtru,
                    taikhoanchinh: taikhoanchinh,
                    hansudung: hansudung,
                    hanghoivien: hanghoivien,
                    notruocdo: notruocdo,
                    tbttkm: tbttkm,
                    tieudung3thang: tieudung3thang,
                }
            });
            setOnBoarding(true);
        } else {
            setWarning(true);
        }

    }

    let setStop  = () => {
        setisStop(prevStop => !prevStop);
        // dispatch({
        //     type: CRAWLED_PAUSE, data: { isStop: isStop }
        // });
    }

    let percentProcess = (index, sum) => {
        console.log("sum ", sum);
        return ((index / sum) * 100).toFixed(2);
    }
    return (
        <div className="crawl-login" id="div_craw">
            <div style={{
                position: "absolute",
                top: "20px",
                fontSize: "36px",
                fontWeight: "600"
            }}>TRA C???U TH??NG TIN THU?? BAO</div>
            {
                !isTracking ?
                    <div>
                        <div className="crawl-login">
                            <div id="crawl_login_file_input_up">
                                {/* <img id="img_file_input" src='../assets/images/file.png' /> */}
                                {
                                    !chooseFile ?
                                        <label htmlFor="xlsx">B???m v??o ????y ????? ch???n t???p(excel)</label>
                                        :
                                        <label htmlFor="xlsx">T???p ???? ch???n l?? {nameFile}</label>
                                }

                                <input type="file"
                                    id="xlsx" name="xlsx"
                                    accept="xlsx" onChange={readFile} />
                                <span id="span_file_input_error"></span>
                            </div>
                            <div className="group-checkbox">
                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={(event) => {
                                                if (event.target.checked) {
                                                    settrangthaigoidi(true);
                                                    setWarning(false);
                                                } else {
                                                    settrangthaigoidi(false);
                                                }
                                            }}
                                        /> <p>Tr???ng th??i g???i ??i </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={(event) => {
                                                if (event.target.checked) {
                                                    settrangthaigoiden(true);
                                                    setWarning(false);
                                                } else {
                                                    settrangthaigoiden(false);
                                                }
                                            }}
                                        /> <p>Tr???ng th??i g???i ?????n </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                settenthuebao(!tenthuebao);
                                            }}
                                        /> <p>T??n thu?? bao </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                settinh(!tinh);
                                            }}
                                        /> <p>T???nh </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setIMSI(!IMSI);
                                            }}
                                        /> <p>IMSI </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setngaysinh(!ngaysinh);
                                            }}
                                        /> <p>Ng??y sinh </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsogt(!sogt);
                                            }}
                                        /> <p>S??? GT </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setngaycap(!ngaycap);
                                            }}
                                        /> <p>Ng??y c???p </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopin(!sopin);
                                            }}
                                        /> <p>S??? PIN </p>
                                    </div>


                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopuk(!sopuk);
                                            }}
                                        /> <p>S??? PUK </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopin2(!sopin2);
                                            }}
                                        /> <p>S??? PIN2 </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopuk2(!sopuk2);
                                            }}
                                        /> <p>S??? PUK2 </p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setdcthuongtru(!dcthuongtru);
                                            }}
                                        /> <p>?????a ch??? th?????ng tr??</p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                settaikhoanchinh(!taikhoanchinh);
                                            }}
                                        /> <p>T??i kho???n ch??nh</p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                sethansudung(!hansudung);
                                            }}
                                        /> <p>H???n s??? d???ng</p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                sethanghoivien(!hanghoivien);
                                            }}
                                        /> <p>H???ng h???i vi??n</p>
                                    </div>
                                </div>

                                <div className="flex-box">
                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setnotruocdo(!notruocdo);
                                            }}
                                        /> <p>N??? tr?????c ????</p>
                                    </div>


                                </div>

                                <div className="form-control">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        defaultChecked
                                        onChange={() => {
                                            settbttkm(!tbttkm);
                                        }}
                                    /> <p>TBTT ???????c tham gia KM</p>
                                </div>

                                <div className="form-control">
                                    <input
                                        type="checkbox"
                                        className="checkbox"
                                        defaultChecked
                                        onChange={() => {
                                            settieudung3thang(!tieudung3thang);
                                        }}
                                    /> <p>Ti??u d??ng 3 th??ng</p>
                                </div>
                            </div>

                            <div className="input-add-div">
                                <input className="input-add" type="number" min="1" max="60" defaultValue="6" placeholder={TR_TYPE_TIME} onChange={onInputTime} />
                                <input className="input-add-button" type="button" value={TR_TYPE_SETUP} onClick={sendDataToServer} />
                            </div>
                        </div>
                        {
                            isCrawlDone && onBoarding ?
                                <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "50%",
                                    width: "100%",
                                    transform: 'translate(-50%, 10px)',
                                }} className="tracking-index-number-upper">
                                    <p>Tra c???u th??nh c??ng, t??n t???p ???? tra c???u l?? <span style={{ color: "green" }}>{nameFile}</span></p>
                                </div>
                                :
                                null
                        }
                        {
                            warning ?
                                <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "50%",
                                    width: "100%",
                                    transform: 'translate(-50%, 10px)',
                                }} className="tracking-index-number-upper">
                                    <p style={{ color: "red" }}>C???n ch???n Tr???ng th??i g???i ??i/ Tr???ng th??i g???i ?????n</p>
                                </div>
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
            {
                isTracking ?
                    <div>
                        {/* <div className="tracking-index-number-upper">
                            <input className="input-add-button" type="button" value={isStop ? BUTTON_CRAWL_PAUSE : BUTTON_CRAWL_CONTINUE } onClick={setStop} />
                        </div> */}
                        <div className="animation-tracking">
                            <div className="crawl-loading-parent" id="div_loginin_loading">
                                <div className="crawl-login-loading">
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="tracking-index-number-upper">
                                <p>??ang tra c???u t???p <span style={{ color: "green" }}>{nameFile}</span></p>
                            </div>
                            <div className="tracking-index-number-upper">
                                <p style={{ textAlign: "center" }}>??ang tra c???u t???i s??? th??? {phoneNumberChecking.index}</p>
                            </div>
                            <div className="tracking-index-number-bellow">
                                <p>Ho??n th??nh {percentProcess(phoneNumberChecking.index, sumIndex)}%</p>
                            </div>
                        </div>

                    </div>
                    :
                    null
            }
        </div>
    );
}