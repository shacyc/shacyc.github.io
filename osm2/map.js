var map = null;
var popup = null;
var lines = [];

/** Icons */
var iconAnchor = [14, 14];
var userIconAnchor = [20, 0];
var iconSize = [28, 28];
var newCaseIconSize = [20, 20];


var iconLocation = 'Content/covidmap/';
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

/** z-index */
var MarkerZIndex = {
    f0new: 35,
    f0: 30,
    f1: 25,
    f2: 20,
    f3: 15,
    f4: 10,
    f5: 5,
    f0dest: 0
};

var clusterMarker = {
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
        if (!patient.LocationLat ||
            patient.LocationLat === "" ||
            patient.LocationLat.toString() === "0" ||
            !patient.LocationLng ||
            patient.LocationLng === "" ||
            patient.LocationLng.toString() === "0" ||
            patient.Status === null
        ) {
            return;
        }

        /** tính loại f */
        patient.ftype = `f${patient.Status - 1}`;
        if (patient.ftype === 'f0' && patient.IsolateDate && patient.IsolateDate.length > 0) {
            var d = new Date(
                patient.IsolateDate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, "$2/$1/$3")
            );
            if (
                f0date.indexOf(
                    `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
                ) > -1
            ) {
                patient.ftype = "f0new";
            }
        }

        /** vẽ marker bệnh nhân */
        var patientLocation = {
            lat: parseFloat(patient.LocationLat),
            lng: parseFloat(patient.LocationLng)
        };
        var marker = L.marker(patientLocation, {
            icon: Icons[patient.ftype],
            zIndexOffset: MarkerZIndex[patient.ftype]
        });

        /** hiển thị popup thông tin chi tiết */
        marker.on("click", function() {

            /** clear line */
            clearLines();

            /** show popup */
            popupContent = `<div>
                    <b>Trường hợp:</b> ${patient.Title}
                </div>
                <div>
                    <b>Địa chỉ:</b> ${patient.Address}
                </div>`;

            if (patient.Visits && patient.Visits.length > 0) {
                popupContent += `
                <div>
                    <b>Lộ trình</b>
                </div>
                <div class="f0-visit-description">
                    ${patient.Visits}
                </div>`;
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
                    setTimeout(() => {
                        polyline.bringToFront();
                    }, 100);

                    lines.push(polyline);
                });
            }


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
                    var visitPopupContent = `<div>
                            <b>Thời gian:</b> ${loc.Timestamp}
                        </div>
                        <div>
                            <b>Địa diểm:</b> ${loc.Visits}
                        </div>`;

                    popup = L.popup()
                        .setLatLng(visitLocation)
                        .setContent(visitPopupContent)
                        .openOn(map);
                });
            });
        }
    } catch (error) {
        console.log(error);
    }
}

/**
 * draw cluster
 */
function drawCluster(ftype) {
    var cluster = new L.MarkerClusterGroup({
        showCoverageOnHover: false,
        animate: false,
        iconCreateFunction: function(cl) {
            return new L.DivIcon({
                html: `<div class="cluster ${ftype}"><div>${cl.getChildCount()}</div></div>`
            });
        }
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
        window.location.origin === "https://shacyc.github.io"
    ) {
        data = jsData.Data;
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
        `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    );
    today.setDate(today.getDate() - 1);
    f0date.push(
        `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`
    );

    data.forEach(patient => {
        /** vẽ các f */
        drawPatient(patient, f0date);
    });

    /** gom vào cluster */
    drawCluster("f345");
    drawCluster("f2");
    drawCluster("f1");
    clusterMarker.f0.forEach(m => {
        m.addTo(map);
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

    var southWest = L.latLng(21.128442, 105.601417),
        northEast = L.latLng(20.879833, 106.085265),
        bounds = L.latLngBounds(southWest, northEast);

    // map = L.map('map', {
    //     maxBounds: bounds
    // });

    map = L.map("map", {maxBounds: bounds}).setView(userLocation ? userLocation : center, zoom);

    // L.tileLayer(
    //     "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw", {
    //         maxZoom: 18,
    //         attribution: '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> ' +
    //             '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    //             '<a href="https://www.mapbox.com/">Mapbox</a>',
    //         id: "mapbox/streets-v11",
    //         tileSize: 512,
    //         zoomOffset: -1
    //     }
    // ).addTo(map);

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

    /** bắt đầu đổ dữ liệu vào map */
    processMap();
}

window.onload = function() {
    initMap();
};