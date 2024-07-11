const tempURL = 'http://127.0.0.1:3001/history/temperature.txt'
const humURL = 'http://127.0.0.1:3001/history/humidity.txt'

const commonGaugeOptions = {
    chart: {
        type: 'gauge',
        className: 'highcharts-gauge-chart',
        marginBottom: 0
    },
    pane: {
        startAngle: -90,
        endAngle: 89.9,
        background: null,
        center: ['50%', '64%'],
        size: '80%'
    },
    yAxis: {
        visible: true,
        min: 0,
        minorTickInterval: null,
        labels: {
            distance: 12,
            allowOverlap: true
        }
    },
    tooltip: {
        enabled: false
    },
    plotOptions: {
        series: {
            dial: {
                baseWidth: 12,
                baseLength: 0,
                rearLength: 0
            },
            pivot: {
                radius: 5
            }
        }
    }
};

async function setupBoard() {

    // Load the dataset
    const temp_2 = await fetch('http://127.0.0.1:3000/temp_node_2')
        .then(response => response.json());
    const temp_3 = await fetch('http://127.0.0.1:3000/temp_node_3')
        .then(response => response.json());
    const hum_2 = await fetch('http://127.0.0.1:3000/hum_node_2')
        .then(response => response.json());
    const hum_3 = await fetch('http://127.0.0.1:3000/hum_node_3')
        .then(response => response.json());

    const board = await Dashboards.board('container', {
        gui: {
            layouts: [{
                id: 'layout-1',
                rows: [{
                    cells: [{
                        id: 'gauges',
                        layout: {
                            rows: [{
                                cells: [{
                                    id: 'temp-gauge-2'
                                }, {
                                    id: 'hum-gauge-2'
                                }]
                            },{
                                cells: [{
                                    id: 'temp-gauge-3'
                                }, {
                                    id: 'hum-gauge-3'
                                }] 
                            }]
                        }
                    }, {
                        id: 'charts',
                        layout: {
                            rows: [{
                                cells: [{
                                    id: 'temp-chart'
                                }]
                            },{
                                cells: [{
                                    id: 'hum-chart'
                                }] 
                            }]
                        }
                    }]
                }]
            }]
        },
        components: [{
            type: 'Highcharts',
            renderTo: 'temp-gauge-2',
            chartOptions: Highcharts.merge(commonGaugeOptions, {
                credits: false,
                title: {
                    text: 'node_2 Temperature',
                },
                yAxis: {
                    min: -10,
                    max: 50,
                    tickPositions: [-10,10,30,40,50],
                    plotBands: [{
                        from: -10,
                        to: 10,
                        className: 'cold-band'
                    }, {
                        from: 10,
                        to: 30,
                        className: 'warm-band'
                    }, {
                        from: 30,
                        to: 40,
                        className: 'hot-band'
                    }, {
                        from: 40,
                        to: 50,
                        className: 'extremehot-band'
                    }]
                },
                data: {
                    csvURL: tempURL,
                    enablePolling: true,
                    endColumn: 1
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            format: '{y} \u2103'
                        }
                    }
                }
            })
        },{
            type: 'Highcharts',
            renderTo: 'temp-gauge-3',
            chartOptions: Highcharts.merge(commonGaugeOptions, {
                credits: false,
                title: {
                    text: 'node_3 Temperature',
                },
                yAxis: {
                    min: -10,
                    max: 50,
                    tickPositions: [-10,10,30,40,50],
                    plotBands: [{
                        from: -10,
                        to: 10,
                        className: 'cold-band'
                    }, {
                        from: 10,
                        to: 30,
                        className: 'warm-band'
                    }, {
                        from: 30,
                        to: 40,
                        className: 'hot-band'
                    }, {
                        from: 40,
                        to: 50,
                        className: 'extremehot-band'
                    }]
                },
                data: {
                    csvURL: tempURL,
                    enablePolling: true,
                    startColumn:1,
                    endColumn: 2,
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            format: '{y} \u2103'
                        }
                    }
                }
            })
        },{
            type: 'Highcharts',
            renderTo: 'hum-gauge-2',
            chartOptions: Highcharts.merge(commonGaugeOptions, {
                credits: false,
                title: {
                    text: 'node_2 Humidity',
                },
                yAxis: {
                    max:100,
                    tickPositions: [0,40,70,100],
                    plotBands: [{
                        from: 0,
                        to: 40,
                        className: 'cold-band'
                    }, {
                        from: 40,
                        to: 70,
                        className: 'warm-band'
                    }, {
                        from: 70,
                        to: 100,
                        className: 'hot-band'
                    }]
                },
                data: {
                    csvURL: humURL,
                    enablePolling: true,
                    endColumn: 1,
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            format: '{y}%'
                        }
                    }
                }
            })
        },{
            type: 'Highcharts',
            renderTo: 'hum-gauge-3',
            chartOptions: Highcharts.merge(commonGaugeOptions, {
                credits: false,
                title: {
                    text: 'node_3 Humidity',
                },
                yAxis: {
                    max:100,
                    tickPositions: [0,40,70,100],
                    plotBands: [{
                        from: 0,
                        to: 40,
                        className: 'cold-band'
                    }, {
                        from: 40,
                        to: 70,
                        className: 'warm-band'
                    }, {
                        from: 70,
                        to: 100,
                        className: 'hot-band'
                    }]
                },
                data: {
                    csvURL: humURL,
                    enablePolling: true,
                    startColumn: 1,
                    endColumn: 2,
                },
                plotOptions: {
                    series: {
                        dataLabels: {
                            useHTML: true,
                            format: '{y}%'
                        }
                    }
                }
            })
        },{
            type: 'Highcharts',
            renderTo: 'temp-chart',
            chartConstructor: 'stockChart',
            chartOptions: {
                credits: false,
                chart: {
                    type: 'line',
                    zooType: 'xy'
                },
                title: {
                    text: 'Temperature'
                },
                series: [{
                    name: 'node 2',
                    data: temp_2
                },{
                    name: 'node 3',
                    data: temp_3
                }],
                yAxis: {
                    title: {
                        text: 'values'
                    },
                },
                xAxis: {
                    type: 'datetime'
                },
                rangeSelector: {
                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '1d',
                        title: 'View 1 day'
                    },{
                        type: 'day',
                        count: 7,
                        text: '7d',
                        title: 'View 7 days'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m',
                        title: 'View 1 month'
                    }, {
                        type: 'ytd',
                        text: 'YTD',
                        title: 'View year to date'
                    }, {
                        type: 'all',
                        text: 'All',
                        title: 'View all'
                    }],
                    selected: 2
                }
            }
        },{
            type: 'Highcharts',
            renderTo: 'hum-chart',
            chartConstructor: 'stockChart',
            chartOptions: {
                credits: false,
                chart: {
                    type: 'line',
                    zooType: 'xy'
                },
                title: {
                    text: 'Humidity'
                },
                series: [{
                    name: 'node 2',
                    data: hum_2
                },{
                    name: 'node 3',
                    data: hum_3
                }],
                yAxis: {
                    title: {
                        text: 'values'
                    },
                },
                xAxis: {
                    type: 'datetime'
                },
                rangeSelector: {
                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '1d',
                        title: 'View 1 day'
                    },{
                        type: 'day',
                        count: 7,
                        text: '7d',
                        title: 'View 7 days'
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m',
                        title: 'View 1 month'
                    }, {
                        type: 'ytd',
                        text: 'YTD',
                        title: 'View year to date'
                    }, {
                        type: 'all',
                        text: 'All',
                        title: 'View all'
                    }],
                    selected: 2
                }
            }
        }]
    }, true);
}
setupBoard();
