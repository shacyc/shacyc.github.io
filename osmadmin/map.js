var map = null;
var popup = null;
var lines = [];
var relationList = [];

/** Icons */
var iconAnchor = [8, 8];
var userIconAnchor = [20, 0];
var iconSize = [16, 16];
var newCaseIconSize = [20, 20];


var iconLocation = '';
if (window.location.origin === "file://" || window.location.origin === "https://shacyc.github.io") {
    iconLocation = '';
}
var Icons = {
    f0new: L.icon({ iconUrl: `${iconLocation}images/f0new.gif`, iconAnchor: iconAnchor, iconSize: newCaseIconSize }),
    f0: L.icon({ iconUrl: `${iconLocation}images/f0.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f1: L.icon({ iconUrl: `${iconLocation}images/f1.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f2: L.icon({ iconUrl: `${iconLocation}images/f2.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f3: L.icon({ iconUrl: `${iconLocation}images/f3.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f4: L.icon({ iconUrl: `${iconLocation}images/f45.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f5: L.icon({ iconUrl: `${iconLocation}images/f45.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    f0dest: L.icon({ iconUrl: `${iconLocation}images/f0dest.svg`, iconAnchor: iconAnchor, iconSize: iconSize }),
    userLocation: L.icon({ iconUrl: `${iconLocation}images/userLocation.svg`, iconAnchor: userIconAnchor }),
    Vietnam: L.icon({ iconUrl: `${iconLocation}images/Vietnam.svg`, iconAnchor: userIconAnchor }),
};

/**
 * các layers
 */
Layers = {
    f0: { pane: null, singleMarker: [], clusterMaker: {}, cluster: {}, clusterLocation: {}, zIndex: 6000 },
    f1: { pane: null, singleMarker: [], clusterMaker: {}, cluster: {}, clusterLocation: {}, zIndex: 5000 },
    f2: { pane: null, singleMarker: [], clusterMaker: {}, cluster: {}, clusterLocation: {}, zIndex: 4000 },
    f345: { pane: null, singleMarker: [], clusterMaker: {}, cluster: {}, clusterLocation: {}, zIndex: 3000 },
}

VisibleCluster = {};

var clusterMarker = {
    f0: [],
    f1: [],
    f2: [],
    f345: [],
    f0dest: [],
    all: []
};

var LineStyle = {
    f0: {
        color: '#f52222'
    },
    f1: {
        color: '#ff9901'
    },
    f2: {
        color: '#fff27b'
    },
    f3: {
        color: '#75deff'
    },
    f4: {
        color: '#75deff'
    },
    f0parent: {
        color: '#f52222'
    },
    isolation: {
        color: '#f52222'
    }
}

/**
 * vẽ các bệnh nhân ra
 * @param {*} patient
 */
function drawPatient(patient) {
    try {

        /** ftype */
        patient.ftype = patient.Type;

        /** vẽ marker bệnh nhân */
        var patientLocation = {
            lat: patient.Home.Lat,
            lng: patient.Home.Lng
        };
        var marker = L.marker(patientLocation, {
            icon: Icons[patient.ftype],
            id: patient.Id,
            locId: patient.locId,
            pane: getMarkerPane(patient.ftype)
        });

        /**đưa marker vào layer */
        switch (patient.ftype) {
            case "f0":
            case "f0new":
                pushMarkerToLayer(Layers.f0, marker);
                break;
            case "f1":
                pushMarkerToLayer(Layers.f1, marker);
                break;
            case "f2":
                pushMarkerToLayer(Layers.f2, marker);
                break;
            case "f3":
            case "f4":
            case "f5":
                pushMarkerToLayer(Layers.f345, marker);
                break;
        }


        /** hiển thị popup thông tin chi tiết */
        marker.on("click", function() {

            /** show popup */
            showPatientPopupInfo(patient, patientLocation);

            /** vẽ cây liên kết của bệnh nhân */
            drawPatientTree(patient);

        });

        /** add vào cluster */
        switch (patient.ftype) {
            case "f0":
            case "f0new":
                clusterMarker.f0.push(marker);
                break;
            case "f1":
                clusterMarker.f1.push(marker);
                break;
            case "f2":
                clusterMarker.f2.push(marker);
                break;
            case "f3":
            case "f4":
            case "f5":
                clusterMarker.f345.push(marker);
                break;
        }

        clusterMarker.all.push(marker)

        /** vẽ các node con */
        patient.Relation.forEach(rel => {
            /** đường dẫn từ gốc đến node hiện tại */
            rel.Path = JSON.parse(JSON.stringify(patient.Path));
            rel.Path.push({
                Lat: patient.Home.Lat,
                Lng: patient.Home.Lng,
                Id: patient.Id
            });

            /** vẽ con */
            drawPatient(rel);
        });
    } catch (error) {
        console.log(error);
    }
}

/**
 * đưa marker vào layer, tùy theo nó có 1 hay nhiều mà đưa vào cluster
 * @param {*} layer 
 * @param {*} marker 
 */
function pushMarkerToLayer(layer, marker) {
    var locId = marker.options.locId;
    if (layer.clusterLocation[locId]) {
        if (!layer.clusterMaker[locId]) {
            layer.clusterMaker[locId] = [];
        }
        layer.clusterMaker[locId].push(marker);
    } else {
        layer.singleMarker.push(marker);
    }
}

/**
 * lấy pane theo marker type
 */
function getMarkerPane(ftype) {
    switch (ftype) {
        case "f0":
        case "f0new":
            return Layers.f0.pane;
        case "f1":
            return Layers.f1.pane;
        case "f2":
            return Layers.f2.pane;
        case "f3":
        case "f4":
        case "f5":
            return Layers.f345.pane;
    }
}

/**
 * hiển thị popup của bệnh nhân
 * @param {*} patient 
 */
function showPatientPopupInfo(patient, patientLocation) {

    /** show popup */
    popupContent = `<div><b>Trường hợp:</b> ${patient.CaseInfo}</div>`;
    popupContent += `<div><b>Địa chỉ:</b> ${patient.Address}</div>`;

    if (patient.PhoneNumber !== null && patient.PhoneNumber !== "") {
        popupContent += `<div><b>Điện thoại:</b> ${patient.PhoneNumber}</div>`;
    }

    if (patient.Element !== null && patient.Element !== "") {
        popupContent += `<div><b>Nguồn lây bệnh:</b> ${patient.Element}</div>`;
    }

    if (patient.DateOfIllness !== null && patient.DateOfIllness !== "") {
        popupContent += `<div><b>Ngày mắc bệnh:</b> ${patient.DateOfIllness}</div>`;
    }

    if (patient.DetectDate !== null && patient.DetectDate !== "") {
        popupContent += `<div><b>Ngày phát hiện:</b> ${patient.DetectDate}</div>`;
    }

    if (patient.DateOfIsolate !== null && patient.DateOfIsolate !== "") {
        popupContent += `<div><b>Ngày cách ly:</b> ${patient.DateOfIsolate}</div>`;
    }

    if (patient.IsolateType !== null && patient.IsolateType !== "") {
        popupContent += `<div><b>Hình thức:</b> ${patient.IsolateType}</div>`;
    }

    if (patient.IsolateAddress !== null && patient.IsolateAddress !== "") {
        popupContent += `<div><b>Địa điểm cách ly:</b> ${patient.IsolateAddress}</div>`;
    }

    if (patient.Visits !== null && patient.Visits !== "") {
        popupContent += `<div><b>Lộ trình:</b> <div class="f0-visits">${patient.Visits}</div></div>`;
    }

    /** show popup */
    popup = L.popup()
        .setLatLng(patientLocation)
        .setContent(popupContent)
        .openOn(map);
}

/**
 * vẽ cây liên kết của bệnh nhân
 * @param {*} patient 
 */
function drawPatientTree(patient) {

    /** clear lines */
    clearLines();

    /** reset relation list */
    relationList = [patient.Id];

    /** vẽ các đường line tới thằng con của nó */
    drawChildRelation(patient);

    /** vẽ các đường line tới thằng lây cho nó (cha) */
    drawParentRelation(patient);

    /** ẩn các marker */
    blurMarker(relationList);
}

/**
 * vẽ các đường line đến con của nó
 * @param {*} patient 
 * @param {*} childRelation 
 */
function drawChildRelation(patient) {
    if (patient.Relation) {
        patient.Relation.forEach(child => {
            /** vẽ đường line */
            var from = { lat: patient.Home.Lat, lng: patient.Home.Lng };
            var to = { lat: child.Home.Lat, lng: child.Home.Lng };
            var line = L.polyline([from, to], {
                color: LineStyle[patient.Type].color,
                weight: 1.5,
                opacity: 1,
                smoothFactor: 1
            }).addTo(map);
            lines.push(line);

            /** add relation list */
            relationList.push(child.Id);

            /** đệ quy để vẽ con */
            drawChildRelation(child);
        });
    }
}

/**
 * vẽ các đường line đến cha của nó
 * @param {*} patient 
 */
function drawParentRelation(patient) {
    if (patient.Path) {
        /** điều chỉnh lại style */
        for (let i = 0; i < patient.Path.length; i++) {

            if (i < patient.Path.length - 1) {
                // các đường cha ( chưa nối đến node hiện tại )
                var from = { lat: patient.Path[i].Lat, lng: patient.Path[i].Lng };
                var to = { lat: patient.Path[i + 1].Lat, lng: patient.Path[i + 1].Lng };
                var line = L.polyline([from, to], {
                    color: LineStyle.f0.color,
                    weight: 3,
                    opacity: 1,
                    smoothFactor: 1
                }).addTo(map);

                lines.push(line);
            } else {
                // đường nối từ chính cha nó đến nó
                var from = { lat: patient.Path[i].Lat, lng: patient.Path[i].Lng };
                var to = { lat: patient.Home.Lat, lng: patient.Home.Lng };
                var line = L.polyline([from, to], {
                    color: LineStyle.f0.color,
                    weight: 3,
                    opacity: 1,
                    smoothFactor: 1
                }).addTo(map);

                lines.push(line);
            }

            /** add relation list */
            relationList.push(patient.Path[i].Id);
        }
    }
}

/**
 * ẩn bớt các marker
 */
function blurMarker(lstRelation) {
    /** clear danh sách hidden cluster */
    VisibleCluster = {};
    $('.f-cluster').addClass('cluster-hidden');

    /** marker các f */
    clusterMarker.all.forEach((m) => {
        if (lstRelation.indexOf(m.options.id) === -1) {
            m.setOpacity(0.1);
        } else {

            /** xác định cluster có marker để hiện lên */
            if (m.options.isInCluster) {
                VisibleCluster[m.options.locId] = true;
                $(`.${m.options.locId}`).removeClass('cluster-hidden')
            }
            m.setOpacity(1);
        }
    });

    /** marker ở theo dõi cách ly */
    IsolationList.forEach(iso => {
        if (lstRelation.indexOf(iso.userId) === -1) {
            /** làm mờ vị trí hiện tại */
            iso.currentLocationMarker.setOpacity(0.1);
            /** ẩn vị trí cách ly */
            iso.isolationPointMarker.setOpacity(0);
        }
    });
}


/**
 * hiển thị hết các marker lên
 */
function clearBlurMarker() {
    /** clear danh sách hidden cluster */
    var VisibleCluster = {};
    $('.cluster-hidden').removeClass('cluster-hidden');

    /** bỏ blur ở marker các f */
    clusterMarker.all.forEach((m) => {
        m.setOpacity(1);
    });

    /** bỏ blur ở marker theo dõi cách ly */
    IsolationList.forEach(iso => {
        iso.currentLocationMarker.setOpacity(1);
        iso.isolationPointMarker.setOpacity(0);
    });
}

/**
 * bắt đầu xử lý map
 */
function processMap() {
    /** get dữ liệu */
    var data = [];

    if (
        window.location.origin === "file://" ||
        window.location.origin === "https://shacyc.github.io"
    ) {
        data = jsData;
    } else {
        $.ajax({
            type: "GET",
            url: "/CovidMap/CovidMapTree",
            dataType: "json",
            async: false,
            success: function(response) {
                data = response;
            },
            error: function() {
                console.log("Không lấy được dữ liệu từ Api.");
            }
        });
    }

    /** chuẩn bị dữ liệu */
    data.forEach(patient => {
        prepareData(patient);
    });
    prepareClusterLocation();
    createPaneLayer();


    /** tạo marker */
    data.forEach(patient => {
        /** nút gốc thì đường dẫn cha của nó = [] */
        patient.Path = [];
        /** vẽ các f */
        drawPatient(patient);
    });

    /** vẽ các điểm ra */
    drawPoints();

    /** vẽ ổ dịch */
    drawOutBreak();
}

/**
 * chuẩn bị dữ liệu
 * tính ra xem có điểm nào trùng nhau không, nếu trùng thì cho vào cluster
 */
function prepareData(patient) {

    var loc = `loc_${patient.Home.Lat.toString().replace('.','')}${patient.Home.Lng.toString().replace('.','')}`;
    switch (patient.Type) {
        case 'f0':
        case 'f0new':
            countClusterLocation(Layers.f0.clusterLocation, loc, patient);
            break;
        case "f1":
            countClusterLocation(Layers.f1.clusterLocation, loc, patient);
            break;
        case "f2":
            countClusterLocation(Layers.f2.clusterLocation, loc, patient);
            break;
        case "f3":
        case "f4":
        case "f5":
            countClusterLocation(Layers.f345.clusterLocation, loc, patient);
            break;
    }

    /** vẽ các node con */
    patient.Relation.forEach(rel => {
        /** vẽ con */
        prepareData(rel);
    });
}

/**
 * trong cluster location, bỏ các thằng chỉ có 1 location
 * những thằng có > 1 location thì đưa vào cluster
 */
function prepareClusterLocation() {
    for (const ftype in Layers) {
        var t = {};
        for (const locId in Layers[ftype].clusterLocation) {
            if (Layers[ftype].clusterLocation[locId] > 1) {
                t[locId] = Layers[ftype].clusterLocation[locId];
            }
        }
        Layers[ftype].clusterLocation = t;
    }
}

/**
 * tạo layer
 * các cluster và none cluster của cùng 1 f thì để cùng 1 index
 */
function createPaneLayer() {
    for (const ftype in Layers) {
        Layers[ftype].pane = map.createPane(`pane-${ftype}`);
        Layers[ftype].pane.style.zIndex = Layers[ftype].zIndex;
    }
}


/**
 * tính ra xem có điểm nào trùng nhau không, nếu trùng thì cho vào cluster
 */
function countClusterLocation(clusterLocation, loc, patient) {
    /** gán location id cho patient */
    patient.locId = loc;

    /** đếm trong cluster */
    if (!clusterLocation[loc]) {
        clusterLocation[loc] = 0;
    }
    clusterLocation[loc] = clusterLocation[loc] + 1;
}

/**
 * vẽ các điểm ra
 */
function drawPoints(cluster) {
    for (const ftype in Layers) {
        var layer = Layers[ftype];

        for (const clusterLayer in Layers[ftype].clusterMaker) {

            /** tạo cluster */
            var cluster = new L.MarkerClusterGroup({
                showCoverageOnHover: false,
                animate: false,
                iconCreateFunction: function(cl) {
                    /** tìm xem trong cluster có thằng nào f0 new không */
                    var clusterType = ftype;
                    if (ftype === 'f0') {
                        var markerChild = cl.getAllChildMarkers();
                        for (let i = 0; i < markerChild.length; i++) {
                            if (markerChild[i].options.ftype === 'f0new') {
                                clusterType = 'f0new-cluster';
                                break;
                            }
                        }
                    }

                    return new L.DivIcon({
                        html: `<div class="f-cluster ${clusterType} ${clusterLayer}"><div>${cl.getChildCount()}</div></div>`
                    });
                },
                clusterPane: layer.pane,
            });

            /** đưa các marker vào cluster */
            Layers[ftype].clusterMaker[clusterLayer].forEach(m => {
                m.options.isInCluster = true;
                cluster.addLayer(m);
            });

            map.addLayer(cluster);
        }

        /** đưa các single marker vào bản đồ */
        layer.singleMarker.forEach(m => {
            m.addTo(map);
        });
    }
}

/**
 * vẽ các ổ dịch
 */
function drawOutBreak() {

}

/**
 * click map event
 */
function mapClickEvent() {
    clearBlurMarker();
    clearLines();
}

/**
 * click map event
 */
function mapZoomEvent() {
    /** xem có phải đang zoom không thì ẩn các cluster đi */
    setTimeout(() => {
        if (Object.keys(VisibleCluster).length !== 0) {
            $('.f-cluster').addClass('cluster-hidden');
            for (const loc in VisibleCluster) {
                $(`.${loc}`).removeClass('cluster-hidden');
            }
        }
    }, 0);
}

/**
 * xóa hết các đường line
 */
function clearLines() {
    /** xóa hết các đường line */
    lines.forEach(line => {
        line.remove();
    });
    lines = [];
}

/**
 * custom map: thêm Hoàng Sa, Trường Sa
 */
function customMap() {
    var HSTS = [
        { lat: 16.531174, lng: 111.611804, title: 'Quần đảo Hoàng Sa' },
        { lat: 10.767119, lng: 115.825618, title: 'Quần đảo Trường Sa' },

    ];
    HSTS.map((qd) => {

        var html = `
        <div class="vietnam">
          <div>${qd.title}</div>
        </div>
        `;

        L.marker({ lat: qd.lat, lng: qd.lng }, {
            icon: new L.DivIcon({
                className: "",
                html: html
            })
        }).addTo(map);
    });

    /** biển đông */
    L.marker({ lat: 12.483703, lng: 114.038648 }, {
        icon: new L.DivIcon({
            className: "",
            html: '<div class="vietnam">Biển Đông</div>'
        })
    }).addTo(map);
}


/**
 * Isolation
 * -----------------------------------------------------------------------------------------------------
 */

/**
 * Cấu hình cách ly 
 */
var IsolationConfig = {
    // NoticeServiceUrl: "http://api.helisoft.vn/event/subscribe/tracking",
    NoticeServiceUrl: "https://apismartcity.hanoi.gov.vn/event/subscribe/tracking",
    NoticeMessageName: "message",
    IsolationPoint: {
        Icon: L.icon({ iconUrl: `${iconLocation}images/isolation-location.svg`, iconAnchor: [18, 30] })
    },
    CurrentPoint: {
        Icon: L.icon({ iconUrl: `${iconLocation}images/warning-animation.gif`, iconAnchor: [16, 20] })
    },
    DistanceStyle: {
        color: '#f52222'
    }
}

/** danh sách những thằng bị cảnh báo */
var IsolationList = [];

/**
 * init notice server để thông báo thằng nào chạy khỏi khu vực cách ly
 */
function initNoticeServer() {
    var me = this;
    // var d = new Date();
    // var message = {
    //     action: 0,
    //     date: `${d.getDate()}/${d.getMonth()}/${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`,
    //     userId: "1",
    //     name: "Nguyễn Đăng Trọng",
    //     location: { lat: 20.9998381, lng: 105.8024501 },
    //     current: { lat: 20.9673207, lng: 105.778012 },
    //     mobile: ["0906221457", "0934568586"],
    //     distance: 145.212158665547
    // }

    // processIsolationMessage(message);

    const eventSource = new EventSource(IsolationConfig.NoticeServiceUrl);

    eventSource.addEventListener(IsolationConfig.NoticeMessageName, function(e) {
        console.log(e.data);

        if (e.data && e.data !== '') {
            var d = JSON.parse(e.data);
            if (d.hasOwnProperty('action')) {
                processIsolationMessage(d);
            }
        }

    });
}

/**
 * xử lý message cách ly
 * @param {*} message 
 */
function processIsolationMessage(message) {

    /** remove khỏi danh sách theo dõi */
    removeIsolationPatient(message.userId);

    /** đi khỏi vị trí cách ly */
    if (message.action === 0) {
        /** add thêm vào danh sách cần theo dõi */
        addIsolationPatient(message);
    }
}

/** remove 1 thằng bệnh nhân đang theo dõi khỏi list */
function removeIsolationPatient(userId) {
    for (let i = 0; i < IsolationList.length; i++) {
        const message = IsolationList[i];
        if (message.userId === userId) {
            /** xóa các marker */
            message.isolationPointMarker.remove();
            message.currentLocationMarker.remove();

            /** xóa item */
            IsolationList.splice(i, 1);
        }
        break;
    }
}

/** thêm 1 thằng bệnh nhân vào danh sách đang theo dõi */
function addIsolationPatient(message) {
    message.Content =
        `<div style="margin-right: 16px;">
        <span style="width: 100px;">Trường hợp:</span> <b>${message.name}</b>
    </div>
    <div>
        Số điện thoại: <b>${message.mobile}</b>
    </div>
    <div>
        Thời điểm ghi nhận: <b>${message.date}</b>
    </div>
    <div>
        Khoảng cách di chuyển: <b>${Math.round((message.distance + Number.EPSILON) * 100) / 100}m</b>
    </div>`;

    /** marker địa điểm cách ly */
    var isolationPointPosition = { lat: message.location.lat, lng: message.location.lng }
    message.isolationPointMarker = L.marker(isolationPointPosition, {
        icon: IsolationConfig.IsolationPoint.Icon,
        id: message.userId,
        pane: Layers.f0.pane,
        opacity: 0
    }).addTo(map);

    /** marker địa điểm hiện tại */
    var currentLocationPosition = { lat: message.current.lat, lng: message.current.lng }
    message.currentLocationMarker = L.marker(currentLocationPosition, {
        icon: IsolationConfig.CurrentPoint.Icon,
        id: message.userId,
        pane: Layers.f0.pane,
        opacity: 1
    }).addTo(map);


    /** add event khi click vào thằng đang di chuyển */
    message.currentLocationMarker.on('click', function() {

        /** ẩn các line */
        clearLines();

        /** ẩn các marker khác */
        blurMarker([message.userId]);

        /** hiện các marker điểm cách ly và điểm hiện tại */
        message.currentLocationMarker.setOpacity(1);
        message.isolationPointMarker.setOpacity(1);

        /** vẽ line */
        var line = L.polyline([isolationPointPosition, currentLocationPosition], {
            color: LineStyle.isolation.color,
            weight: 1.5,
            opacity: 1,
            smoothFactor: 1
        }).addTo(map);

        lines.push(line);

        /** show popup */
        popup = L.popup()
            .setLatLng(currentLocationPosition)
            .setContent(message.Content)
            .openOn(map);
    });

    IsolationList.push(message);
}


/**
 * End Isolation
 * -----------------------------------------------------------------------------------------------------
 */

/**
 * init map
 */
function initMap() {
    var center = { lat: 21.0012406, lng: 105.7938073 };
    var zoom = 13;
    var userLocation = null;

    /** lấy location user từ trên url */
    try {
        var url = new URL(window.location.href);
        var lat = url.searchParams.get("lat");
        var lng = url.searchParams.get("lon");
        // lat = 21.027794;
        // lng = 105.852263;
        if (lat && lng) {
            userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };
            zoom = 15;
        }
    } catch (error) {
        console.log("Lấy location của user bị lỗi.");
    }

    map = L.map("map", {}).setView(userLocation ? userLocation : center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    /** vẽ vị trí user */
    if (userLocation) {
        L.marker(userLocation, { icon: Icons.userLocation }).bindPopup('Bạn đang ở đây').addTo(map);
    }

    /** custom map */
    customMap();

    /** map event */
    map.on('click', mapClickEvent)

    /** map event */
    map.on('zoomend', mapZoomEvent)

    /** bắt đầu đổ dữ liệu vào map */
    processMap();
}

window.onload = function() {
    initMap();
    initNoticeServer();
};