import React, { useState, useEffect } from "react";
import '../../assets/css/home/home.css';
import '../../assets/css/home/home.style.css';
import { TR_TYPE_SETUP } from "../../constants/home/home.constant";
import { GET_LENGHT_LIST, START_CRAWL_DATA } from "../../action/home/home.action";
import { readFileExcel } from "../../service/excel/excel.client.service";
import { useSelector, useDispatch } from 'react-redux';
import '../../assets/css/home/rc-checkbox.css';

export default function Home() {
    const [mTime, setMTime] = useState(2);
    const [isTracking, setIsTracking] = useState(false);
    const [nameFile, setNameFile] = useState("");
    const [onBoarding, setOnBoarding] = useState(false);

    const [trangthaigoidi, settrangthaigoidi] = useState(false);
    const [trangthaigoiden, settrangthaigoiden] = useState(false);
    const [tenthuebao, settenthuebao] = useState(false);
    const [tinh, settinh] = useState(false);
    const [IMSI, setIMSI] = useState(false);
    const [ngaysinh, setngaysinh] = useState(false);
    const [sogt, setsogt] = useState(false);
    const [ngaycap, setngaycap] = useState(false);
    const [sopin, setsopin] = useState(false);
    const [sopuk, setsopuk] = useState(false);
    const [sopin2, setsopin2] = useState(false);
    const [sopuk2, setsopuk2] = useState(false);
    const [dcthuongtru, setdcthuongtru] = useState(false);
    const [taikhoanchinh, settaikhoanchinh] = useState(false);
    const [hansudung, sethansudung] = useState(false);
    const [hanghoivien, sethanghoivien] = useState(false);
    const [notruocdo, setnotruocdo] = useState(false);
    const [tbttkm, settbttkm] = useState(false);
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
        let nameFile = e.target.files[0].name;
        setNameFile(nameFile);
        readFileExcel(e.target.files[0], (data) => {
            setIsTracking(true);
            //data là mảng chứa danh sách thuê bao và số tiền
            dispatch({ type: GET_LENGHT_LIST, data: { sumIndex: data.length } });
            data.forEach((item, index) => {
                //Bỏ qua dòng đầu vì là tiêu đề
                if (index > 0) {
                    // console.log("data in file excel", item);
                    // dispatch({ type: SEND_NUMBER_TOSERVER, data: { phone: item[0], index: item[1] } });
                    let itemPhone = {
                        index: index,
                        phone: item[0]
                    }
                    listPhone.push(itemPhone);
                }
                if (index == (data.length - 1)) {
                    console.log("data - endoflist", item[0], " ", item[1], " listPhone", listPhone);
                    return;
                }
            });
        });

        //phải cần dòng dưới, vì nếu như lần thứ hai chọn cùng 1 file, sẽ không được tính là opnchange, hàm onchange sẽ không gọi lại
        e.target.value = null;
    }

    let sendDataToServer = () => {
        if (trangthaigoiden || trangthaigoidi) {
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
                    tbttkm: tbttkm
                }
            });
            setOnBoarding(true);
        } else {
            setWarning(true);
        }

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
            }}>TRA CỨU THÔNG TIN THUÊ BAO</div>
            {
                !isTracking ?
                    <div>
                        <div className="crawl-login">
                            <div id="crawl_login_file_input_up">
                                {/* <img id="img_file_input" src='../assets/images/file.png' /> */}
                                <label htmlFor="xlsx">Bấm vào đây để chọn tệp(excel)</label>
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
                                                if(event.target.checked){
                                                    settrangthaigoidi(true);
                                                    setWarning(false);
                                                }else{
                                                    settrangthaigoidi(false);
                                                }
                                            }}
                                        /> <p>Trạng thái gọi đi </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={(event) => {
                                                if(event.target.checked){
                                                    settrangthaigoiden(true);
                                                    setWarning(false);
                                                }else{
                                                    settrangthaigoiden(false);
                                                }
                                            }}
                                        /> <p>Trạng thái gọi đến </p>
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
                                        /> <p>Tên thuê bao </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                settinh(!tinh);
                                            }}
                                        /> <p>Tỉnh </p>
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
                                        /> <p>Ngày sinh </p>
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
                                        /> <p>Số GT </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setngaycap(!ngaycap);
                                            }}
                                        /> <p>Ngày cấp </p>
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
                                        /> <p>Số PIN </p>
                                    </div>


                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopuk(!sopuk);
                                            }}
                                        /> <p>Số PUK </p>
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
                                        /> <p>Số PIN2 </p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                setsopuk2(!sopuk2);
                                            }}
                                        /> <p>Số PUK2 </p>
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
                                        /> <p>Địa chỉ thường trú</p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                settaikhoanchinh(!taikhoanchinh);
                                            }}
                                        /> <p>Tài khoản chính</p>
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
                                        /> <p>Hạn sử dụng</p>
                                    </div>

                                    <div className="form-control">
                                        <input
                                            type="checkbox"
                                            className="checkbox"
                                            defaultChecked
                                            onChange={() => {
                                                sethanghoivien(!hanghoivien);
                                            }}
                                        /> <p>Hạng hội viên</p>
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
                                        /> <p>Nợ trước đó</p>
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
                                    /> <p>TBTT được tham gia KM</p>
                                </div>
                            </div>

                            <div className="input-add-div">
                                {/* <input className="input-add" type="number" min="1" max="60" defaultValue="1" placeholder={TR_TYPE_TIME} onChange={onInputTime} /> */}
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
                                    <text>Tra cứu thành công , tên tệp đã crawl là <span style={{ color: "green" }}>{nameFile}</span></text>
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
                                    <text style={{ color: "red" }}>Cần chọn Trạng thái gọi đi/ Trạng thái gọi đến</text>
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
                                <text>Đang tra cứu tệp <span style={{ color: "green" }}>{nameFile}</span></text>
                            </div>
                            <div className="tracking-index-number-upper">
                                <text style={{ textAlign: "center" }}>Đang tra cứu tới số thứ {phoneNumberChecking.index}</text>
                            </div>
                            <div className="tracking-index-number-bellow">
                                <text>Hoàn thành {percentProcess(phoneNumberChecking.index, sumIndex)}%</text>
                            </div>
                        </div>

                    </div>
                    :
                    null
            }
        </div>
    );
}