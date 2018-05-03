scriptVersion = 1.1

var timetable = require('scripts/timetable')
var ticketcCheck = require('scripts/ticketcCheck')
var tool = require('scripts/tool')
var station = $file.read('assets/station_names.json')
var stationObject = JSON.parse(station.string)

module.exports.render = function render() {
    $ui.render({
        props: {
            title: "12306"
        },
        views: [{
                type: "input",
                props: {
                    id: "departureStation",
                    placeholder: "出发地"
                },
                layout: function(make) {
                    make.top.left.right.inset(10)
                    make.height.equalTo(50)
                }
            },
            {
                type: "input",
                props: {
                    id: "terminalStation",
                    placeholder: "目的地"
                },
                layout: function(make) {
                    make.left.right.inset(10)
                    make.top.equalTo($("departureStation").bottom).offset(10)
                    make.height.equalTo(50)
                }
            },
            {
                type: "button",
                props: {
                    id: "ticketcCheck",
                    title: "查询余票"
                },
                layout: function(make) {
                    make.left.right.inset(10)
                    make.top.equalTo($("terminalStation").bottom).offset(10)
                    make.height.equalTo(50)
                },
                events: {
                    tapped: function(sender) {
                        $("departureStation").blur()
                        $("terminalStation").blur()
                        search()
                    }

                }
            },
            {
                type: "button",
                props: {
                    title: "时刻表查询"
                },
                layout: function(make) {
                    make.left.right.inset(10)
                    make.top.equalTo($("ticketcCheck").bottom).offset(10)
                    make.height.equalTo(50)
                },
                events: {
                    tapped: function(sender) {
                        $("input").blur()
                        timetable.showTimeTable()
                    }

                }
            }
        ]
    })
}

function search() {
    $ui.loading(true)
    var departureStation = stationObject[$("departureStation").text]
    var terminalStation = stationObject[$("terminalStation").text]
    var url = "https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=" + tool.currentDate + "&leftTicketDTO.from_station=" + departureStation + "&leftTicketDTO.to_station=" + terminalStation + "&purpose_codes=ADULT"
    $console.info(departureStation)
    $console.info(terminalStation)
    $console.info(url)
    $http.request({
        method: "GET",
        url: url,
        handler: function(resp) {
            $console.info(resp)
            $ui.loading(false)
            var resultGroup = resp.data.data.result.map(function(item) {
                var resultTuple = item.split("|")
                return { station_code: { text: resultTuple[3] }, site_name: { text: $("departureStation").text + "-" + $("terminalStation").text }, total_time: { text: resultTuple[8] + "-" + resultTuple[9] }, stopover_time: { text: resultTuple[10] }, excess_ticket: { text: tool.excessTicket(resultTuple) } }
            })
            $console.info(resultGroup)
            ticketcCheck.showTicketcCheck()
            ticketcCheck.giveData(resultGroup)
        }
    })
}


checkupVersion()

//检查版本
function checkupVersion() {
    $http.get({
        url: "https://raw.githubusercontent.com/mTerminal/xTeko/master/12306/UpdateInfo",
        handler: function(resp) {
            $console.info(resp.data)
            var version = resp.data.version;
            var message = resp.data.message;
            if (version > scriptVersion) {
                $ui.alert({
                    title: "发现新版本",
                    message: message,
                    actions: [{
                            title: "忽略",
                            handler: function() {}
                        },
                        {
                            title: "更新",
                            handler: function() {
                                var url = "jsbox://install?name=12306&url=https://raw.githubusercontent.com/mTerminal/xTeko/master/12306/12306.box"
                                $app.openURL(encodeURI(url))
                                $app.close()
                            }
                        }
                    ]
                })
            }
        }
    })
}