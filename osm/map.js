var map = null;
var popup = null;
var lines = [];

/** Icons */
var iconAnchor = [9, 9];
var userIconAnchor = [20, 0];
var iconSize = [18, 18];
var newCaseIconSize = [20, 20];
var f0destIconSize = [16, 16];


var iconLocation = 'Content/covidmap/';
if (window.location.origin === "file://" ||
    window.location.origin === "http://127.0.0.1:5500" ||
    window.location.origin === "https://shacyc.github.io") {
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
    f0dest: L.icon({ iconUrl: `${iconLocation}images/f0dest.svg`, iconAnchor: iconAnchor, iconSize: f0destIconSize }),
    userLocation: L.icon({ iconUrl: `${iconLocation}images/userLocation.svg`, iconAnchor: userIconAnchor }),
    Vietnam: L.icon({ iconUrl: `${iconLocation}images/Vietnam.svg`, iconAnchor: userIconAnchor }),
};

var PaneList = {
    f0new: { pane: null, zIndex: 6000 },
    f0: { pane: null, zIndex: 5000 },
    f1: { pane: null, zIndex: 4000 },
    f2: { pane: null, zIndex: 3000 },
    f345: { pane: null, zIndex: 2000 },
    f0dest: { pane: null, zIndex: 1000 }
}

var clusterMarker = {
    f0new: [],
    f0: [],
    f1: [],
    f2: [],
    f345: [],
    f0dest: []
};

/**
 * vẽ các bệnh nhân ra
 * @param {*} patient
 */
function drawPatient(patient, f0date) {
    try {
        /** check dữ liệu */
        if (!patient.Lat || patient.Lat === "" || patient.Lat.toString() === "0" || !patient.Lat || patient.Lat === "" || patient.Lat.toString() === "0" || patient.Type < 0) {
            return;
        }

        /** tính loại f */
        patient.ftype = `f${patient.Type}`;
        if (patient.ftype === 'f0' && patient.DetectDate) {
            if (f0date.indexOf(patient.DetectDate) > -1) {
                console.log(patient.DetectDate)
                patient.ftype = "f0new";
            }
        }

        /** bỏ vẽ f2 f3 f4 */
        var removef = ['f2', 'f3', 'f4', 'f5']
        if (removef.indexOf(patient.ftype) > -1) {
            return;
        }

        /** đưa marker vào pane */
        var paneName = patient.ftype;
        switch (paneName) {
            case 'f3':
            case 'f4':
            case 'f5':
                paneName = 'f345'
                break;
        }

        /** vẽ marker bệnh nhân */
        var patientLocation = {
            lat: parseFloat(patient.Lat),
            lng: parseFloat(patient.Lng)
        };
        var marker = L.marker(patientLocation, {
            icon: Icons[patient.ftype],
            pane: PaneList[paneName].pane,
            ftype: patient.ftype
        });

        /** hiển thị popup thông tin chi tiết */
        marker.on("click", function() {
            f0_click(patient, patientLocation)
        });

        /** add vào cluster */
        switch (patient.ftype) {
            // case "f0new":
            //     clusterMarker.f0new.push(marker);
            //     break;
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

        /** vẽ điểm đến của f0 */
        if (patient.Locations && patient.Locations.length > 0) {
            patient.Locations.forEach(loc => {
                /** vẽ điểm đến */
                var visitLocation = {
                    lat: loc.Lat,
                    lng: loc.Lng
                };
                var f0VisitMarker = L.marker(visitLocation, {
                    icon: Icons.f0dest,
                    zIndexOffset: 0
                }).addTo(map);
                clusterMarker.f0dest.push(f0VisitMarker);

                /** hiển thị popup */
                f0VisitMarker.on("click", function() {
                    f0dest_click(patient, loc, visitLocation, patientLocation);
                });
            });
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * show thông tin f0
 */
function f0_click(patient, patientLocation) {
    /** clear line */
    clearLines();

    /** build popup content */
    var popupContent = '';
    if (patient.ftype.startsWith('f0')) {
        /** đổi với f0 */
        var detectDate = patient.DetectDate ? `ngày phát hiện ${patient.DetectDate}` : ''
        popupContent += `<div><b>Trường hợp:</b> ${patient.Code} ${detectDate}</div>`;
        if (patient.Source) {
            popupContent += `<div><b>Nguồn lây:</b> ${patient.Source}</div>`;
        }
        if (patient.Address) {
            popupContent += `<div><b>Địa chỉ:</b> ${patient.Address}</div>`;
        }
        if (patient.IsolateAddress) {
            popupContent += `<div><b>Nơi cách ly:</b> ${patient.IsolateAddress}</div>`;
        }
        if (patient.Visits) {
            popupContent += `<div><b>Lộ trình:</b></div><div class="f0-visits">${patient.Visits}</div>`;
        }
    } else {
        /** không phải f0 */
        var isolateDate = patient.DateOfIsolate ? `ngày cách ly ${patient.DateOfIsolate}` : ''
        popupContent += `<div><b>Trường hợp:</b> ${patient.Code} ${isolateDate}</div>`;
        if (patient.Source) {
            popupContent += `<div><b>Nguồn lây:</b> ${patient.Source}</div>`;
        }
        if (patient.Address) {
            popupContent += `<div><b>Địa chỉ:</b> ${patient.Address}</div>`;
        }
    }

    /** hide description */
    $('.description').hide();
    popup = L.popup()
        .setLatLng(patientLocation)
        .setContent(popupContent)
        .openOn(map);

    /** vẽ đường tới các điểm đến */
    if (patient.Locations && patient.Locations.length > 0) {
        patient.Locations.forEach(loc => {
            /** tọa độ điểm đến */
            var visitLocation = {
                lat: loc.Lat,
                lng: loc.Lng
            }
            var polyline = L.polyline([patientLocation, visitLocation], {
                color: '#ff6666',
                weight: 2,
                opacity: 1,
                smoothFactor: 1
            }).addTo(map);

            lines.push(polyline);
        });
    }
}

/**
 * show thông tin điểm đến
 * @param {*} loc 
 */
function f0dest_click(patient, loc, visitLocation, patientLocation) {
    /** show pop up điểm đến */
    var visitPopupContent = `<div><b>Trường hợp:</b>${patient.Code}</div>`;
    var visitDate = '';
    if (loc.Timestamp) {
        var d = new Date(loc.Timestamp);
        visitPopupContent += `<div><b>Thời gian:</b>${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}</div>`;
    }
    if (loc.Visits) {
        visitPopupContent += `<div><b>Địa diểm:</b> ${loc.Visits}</div>`;
    }

    popup = L.popup()
        .setLatLng(visitLocation)
        .setContent(visitPopupContent)
        .openOn(map);

    /**
     * vẽ đường đi
     */
    clearLines();
    var polyline = L.polyline([patientLocation, visitLocation], {
        color: '#ff6666',
        weight: 2,
        opacity: 1,
        smoothFactor: 1
    }).addTo(map);

    lines.push(polyline);
}

/**
 * draw cluster
 */
function drawCluster(ftype) {

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
                html: `<div class="cluster ${clusterType}"><div>${cl.getChildCount()}</div></div>`
            });
        },
        clusterPane: PaneList[ftype].pane,
        // maxClusterRadius: (ftype === 'f0' ? 1 : 80)
    });

    clusterMarker[ftype].forEach(m => {
        cluster.addLayer(m);
    });

    map.addLayer(cluster);
}

/**
 * bắt đầu xử lý map
 */
function processMap() {
    /** get dữ liệu */
    var data = [];

    if (
        window.location.origin === "file://" ||
        window.location.origin === "http://127.0.0.1:5500" ||
        window.location.origin === "https://shacyc.github.io"
    ) {
        data = jsData.Data;
        // var x = $.grep(data, function(d) {
        //     return d.Code === 'BN-111';
        // })[0];
        // for (let index = 0; index < 50; index++) {
        //     var y = JSON.parse(JSON.stringify(x))
        //     y.Code = `00000000${index}`;
        //     data.push(y);
        // }
    } else {
        $.ajax({
            type: "GET",
            url: "/Home/CovidPatient",
            dataType: "json",
            async: false,
            success: function(response) {
                data = response.Data;
            },
            error: function() {
                console.log("Không lấy được dữ liệu từ Api.");
            }
        });
    }

    /** tính toán ngày hqua và hnay để hiển thị f0 new */
    var f0date = [];
    var today = new Date();
    f0date.push(
        `${today.getDate()}/${('0' + (today.getMonth() + 1)).slice(-2)}/${today.getFullYear()}`
    );
    today.setDate(today.getDate() - 1);
    f0date.push(
        `${today.getDate()}/${('0' + (today.getMonth() + 1)).slice(-2)}/${today.getFullYear()}`
    );

    data.forEach(patient => {
        /** vẽ các f */
        drawPatient(patient, f0date);
    });

    /** gom vào cluster */
    drawCluster("f345");
    drawCluster("f2");
    drawCluster("f1");
    drawCluster("f0");

    /** vẽ các thằng f0 new */
    clusterMarker.f0new.forEach(f => {
        f.addTo(map);
    });

    /** vẽ các ổ dịch */
    drawOutBreak();
}

/**
 * vẽ các ổ dịch
 */
function drawOutBreak() {
    var area = [{
            Areas: [
                [21.004129, 105.841088],
                [21.004095, 105.839690],
                [21.003893, 105.838364],
                [21.000280, 105.838237],
                [21.000280, 105.838237],
                [20.999252, 105.839410],
                [20.999210, 105.841097],
            ],
            Name: 'Bệnh viện Bạch Mai',
            Description: '2 bác sĩ bị lây nhiễm chéo'
        },
        {
            Areas: [
                [21.006670, 105.831970],
                [21.005933, 105.832448],
                [21.005933, 105.832448],
                [21.005947, 105.831906],
                [21.006121, 105.831515],
                [21.006202, 105.831318],

            ],
            Name: 'Vincom Center Phạm Ngọc Thạch',
            Description: '2 bác sĩ bị lây nhiễm chéo'
        }
    ]

    area.forEach(d => {
        var content = `<div><b>${d.Name}</b></div><div class="f0-visit">${d.Description}</div>`;
        var polygon = L.polygon(d.Areas, { color: 'red' }).bindPopup(content).addTo(map);
    });

    var circle = [{
        Lat: 21.010390,
        Lng: 105.822726,
        radius: 1,
        Name: 'miến lươn 42 Thái Hà',
        Description: '12-14h ngày 19/3'
    }]

    circle.forEach(d => {
        var content = `<div><b>${d.Name}</b></div><div class="f0-visit">${d.Description}</div>`;
        L.circle([d.Lat, d.Lng], { radius: 10, color: 'red' }).bindPopup(content).addTo(map);
    });
}

/**
 * click map event
 */
function mapClickEvent() {

    /** show description */
    $('.description').show();

    /** clear lines */
    clearLines();
}

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
          <img src="${Icons.Vietnam.options.iconUrl}">
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
 * tạo các layer pane chứa các f theo z index
 */
function createPaneLayer(ftype) {
    PaneList[ftype].pane = map.createPane(`pane-${ftype}`);
    PaneList[ftype].pane.style.zIndex = PaneList[ftype].zIndex;
}

/**
 * init map
 */
function initMap() {
    var center = { lat: 21.0012406, lng: 105.7938073 };
    var zoom = 12;
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

    /**
     * tạo map
     */
    var topLeft = L.latLng(21.803614, 104.732575),
        bottomRight = L.latLng(19.902267, 107.354473),
        bounds = L.latLngBounds(topLeft, bottomRight);

    map = L.map("map", {
        maxBounds: bounds,
        minZoom: 9.5,
        zoomControl: false
    }).setView(userLocation ? userLocation : center, zoom);

    /**
     * layer chứa dữ liệu bản đồ
     */
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    /**
     * tạo các layer cho các f
     */
    createPaneLayer('f0dest');
    createPaneLayer('f345');
    createPaneLayer('f2');
    createPaneLayer('f1');
    createPaneLayer('f0');
    createPaneLayer('f0new');

    /** vẽ vị trí user */
    if (userLocation) {
        L.marker(userLocation, { icon: Icons.userLocation }).bindPopup('Bạn đang ở đây').addTo(map);
    }

    /** custom map */
    // customMap();

    /** map event */
    map.on('click', mapClickEvent)

    /** bắt đầu đổ dữ liệu vào map */
    processMap();
}



/**
 * search
 * ----------------------------------------------------------------------------------
 */
function initSearch() {
    $('#searchBox').focus(function() {
        $('#cancelSearch').show();
        $('#searchResult').fadeIn('fast');
    })

    $('#cancelSearch').click(function() {
        $('#searchResult').fadeOut('fast');
        $('#cancelSearch').hide();
    })
}

/**
 * info box
 */
function initInfoBox() {
    $('#infoBox').draggable({
        axis: "y",
        drag: function(e, d) {
            console.log();
            if (d.position.top && d.position.top <= 60) {
                return false;
            }
        },
    });
}


/**
 * window onload
 */
window.onload = function() {
    initMap();
    initSearch();
    initInfoBox();
};