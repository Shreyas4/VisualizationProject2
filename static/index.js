header = document.getElementById("tasks-menu-list");
items = header.getElementsByClassName("list-item");
for (let i = 0; i < items.length; i++) {
    items[i].addEventListener("click", function() {
        const current = header.getElementsByClassName("active");
        if (current.length > 0) {
            current[0].className = current[0].className.replace(" active", "");
        }
        this.className += " active";
        updateData(this.attributes.value, document.getElementById("data-menu-list").getElementsByClassName("active")[0].attributes.value);
    });
}

header2 = document.getElementById("data-menu-list");
items2 = header2.getElementsByClassName("list-item");
for (let i = 0; i < items2.length; i++) {
    items2[i].addEventListener("click", function() {
        const current = header2.getElementsByClassName("active");
        if (current.length > 0) {
            current[0].className = current[0].className.replace(" active", "");
        }
        this.className += " active";
        updateData(document.getElementById("tasks-menu-list").getElementsByClassName("active")[0].attributes.value, this.attributes.value);
    });
}

function updateChart(chart_data, task, datatype) {
    switch(task.value) {
        case 'screePCA':
            drawScreePCA('screePCA', datatype.value, chart_data);
            break;
        case 'screePCALoadings':
            drawPCALoadings('screePCALoadings', datatype.value, chart_data);
            break;
        case 'scatter2PCA':
            drawScatter2PCA('scatter2PCA', datatype.value, chart_data);
            break;
        default:
        // code block
    }
}

function updateData(task, datatype) {
    $.post("", {'task': task.value, 'datatype': datatype.value}, function (data_received) {
        updateChart(data_received, task, datatype);
    });
}

updateData({'value': 'screePCA'}, {'value':'og'});

function drawScreePCA(task, datatype, chart_data) {
    d3.selectAll("svg > *").remove();
    const svg = d3.select('svg');

    const svgMargin = 120;
    const svgHeight =document.getElementById('container').clientHeight-(2*svgMargin);
    const svgWidth = document.getElementById('container').clientWidth-(2*svgMargin);

    const chart = svg.append('g')
        .attr('transform', 'translate('+svgMargin+','+svgMargin+')');

    var my_sample = [];
    for (var i=0; i<chart_data['xticks'].length; i++) {
        if (task==='screePCA') {
            my_sample.push({'selected_attr':chart_data['xticks'][i], 'count':chart_data['yticks'][i], 'running_sum': chart_data['running_sum'][i]});
        } else {
            my_sample.push({'selected_attr':chart_data['xticks'][i], 'count':chart_data['yticks'][i]});
        }
    }

    yList = my_sample.map(function (a) {
        return a.count;
    });
    xList = my_sample.map(function (a) {
        return a.selected_attr;
    });

    const xScale = d3.scaleBand()
        .range([0, svgWidth])
        .domain(xList)
        .padding(0.35);

    let yScale = d3.scaleLinear()
        .range([svgHeight, 0])
        .domain([0, d3.max(yList)+d3.max(yList)/10]);
    if (task==='screePCA') {
        yScale = d3.scaleLinear()
            .range([svgHeight, 0])
            .domain([0, 100]);
    }

    const color = '#117D7F';
    const colorScale = d3.scaleLinear()
        .domain([d3.min(yList), d3.max(yList)])
        .range([d3.rgb(color).darker(), d3.rgb(color).brighter()]);

    const preThresholdColor = '#7f2420';

    const preThresholdColorScale = d3.scaleLinear()
        .domain([d3.min(yList), d3.max(yList)])
        .range([d3.rgb(preThresholdColor).darker(), d3.rgb(preThresholdColor).brighter()]);

    const horizontalLines = function () {
        return d3.axisLeft()
            .scale(yScale)
    };

    var rotateBy = '0';
    var xLabelPosition = 1.7;
    if (task==='screePCALoadings') {
        rotateBy = '-30';
    }

    chart.append('g')
        .attr('transform', 'translate(0,'+svgHeight+')')
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("transform", "rotate("+rotateBy+")");

    chart.selectAll('.tick line').remove();

    if (task==='screePCA'){
        chart.append('g')
            .call(d3.axisLeft(yScale).tickFormat(function(d) { return d + "%"; })).selectAll('.tick line').remove();
    } else {
        chart.append('g')
            .call(d3.axisLeft(yScale)).selectAll('.tick line').remove();
    }


    chart.append('g')
        .attr('class', 'grid')
        .call(horizontalLines()
            .tickSize(-svgWidth, 0, 0)
            .tickFormat(''));

    const barGroups = chart.selectAll()
        .data(my_sample)
        .enter()
        .append('g');

    barGroups.append('rect')
        .attr('class', 'bar')
        .attr('x', function(g) {
            return xScale(g.selected_attr);
        })
        .attr('y', function (g) {
            return yScale(g.count);
        })
        .attr('height', function (g) {
            return svgHeight - yScale(g.count);
        })
        .attr('width', xScale.bandwidth())
        .attr('fill', function(d) {
            if (d.count >= chart_data['threshold']) {
                return preThresholdColorScale(d.count);
            } else {
                return colorScale(d.count);
            }
        })
        .on('mouseover', function (d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('opacity', 0.6)
                .attr('x', function (a) {
                    return xScale(a.selected_attr) - 5;
                })
                .attr('width', xScale.bandwidth() + 10)
                .attr('y', function (g) {
                    return yScale(g.count+d3.mean(yList)/20);
                })
                .attr('height', function (g) {
                    return svgHeight - yScale(g.count+d3.mean(yList)/20);
                });
            barGroups.append("text")
                .attr('class', 'val')
                .attr('x', function() {
                    return xScale(d.selected_attr);
                })
                .attr('y', function() {
                    return yScale(d.count) - 20;
                })
                .text(function() {
                    return [+d.count];
                });
        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('opacity', 1)
                .attr('x', function (a) {
                    return xScale(a.selected_attr);
                })
                .attr('width', xScale.bandwidth())
                .attr('y', function (g) {
                    return yScale(g.count);
                })
                .attr('height', function (g) {
                    return svgHeight - yScale(g.count);
                });
            d3.selectAll('.val')
                .remove()
        });


    if (task==='screePCA') {
        const lineElements = chart.selectAll()
            .data(my_sample)
            .enter()
            .append('g');

        const lineGenerator = d3.line()
            .x(function (d) {
                return xScale(d.selected_attr);
            })
            .y(function (d) {
                return yScale(d.running_sum);
            });

        lineElements.append('path')
            .attr('class', 'line-path')
            .attr('d', lineGenerator(my_sample));
        chart.append('line')
            .attr('class', 'identifier')
            .attr('x1', xScale(chart_data['threshold-x']))
            .attr('y1', svgHeight)
            .attr('x2', xScale(chart_data['threshold-x']))
            .attr('y2', yScale(chart_data['Acceptable variance explained']));

        chart.append('line')
            .attr('class', 'identifier')
            .attr('x1', xScale(0))
            .attr('y1', yScale(chart_data['Acceptable variance explained']))
            .attr('x2', xScale(chart_data['threshold-x']))
            .attr('y2', yScale(chart_data['Acceptable variance explained']));

        chart.append("text")
            .attr('class', 'label')
            .attr('x', xScale(chart_data['threshold-x'])+20)
            .attr('y', yScale(chart_data['Acceptable variance explained'])+20)
            .text(chart_data['Acceptable variance explained']+ "% variance explained by "+ chart_data['limit'] + " vectors");

    }


    svg.append('text')
        .attr('class', 'label')
        .attr('x', - (svgHeight / 2) - svgMargin)
        .attr('y', svgMargin / 2.4)
        .attr('transform', 'rotate(-90)')
        .attr('text-anchor', 'middle')
        .text(chart_data['ylabel']);

    svg.append('text')
        .attr('class', 'label')
        .attr('x', svgWidth / 2 + svgMargin)
        .attr('y', svgHeight + svgMargin*xLabelPosition)
        .attr('text-anchor', 'middle')
        .text(chart_data['xlabel']);

    svg.append('text')
        .attr('class', 'title')
        .attr('x', svgWidth / 2 + svgMargin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(chart_data['Chart Title']);

    svg.style('display', 'block').style('margin', 'auto');

}

function drawPCALoadings(task, datatype, chart_data) {
    drawScreePCA(task, datatype, chart_data);
}

function drawScatter2PCA(scatter2PCA, value, chart_data) {
    console.log(scatter2PCA, value, chart_data);
    d3.selectAll("svg > *").remove();
    const svg = d3.select('svg');

    const svgMargin = 100;
    const svgHeight =document.getElementById('container').clientHeight-(2*svgMargin);
    const svgWidth = document.getElementById('container').clientWidth-(2*svgMargin);

    const chart = svg.append('g')
        .attr('transform', 'translate('+svgMargin+','+svgMargin+')');

    var xScale = d3.scaleLinear()
        .range([0, svgWidth])
        .domain([Math.floor(chart_data['minmax']['p1_min']), Math.ceil(chart_data['minmax']['p1_max'])]);

    var yScale = d3.scaleLinear()
        .range([svgHeight, 0])
        .domain([Math.floor(chart_data['minmax']['p2_min']), Math.ceil(chart_data['minmax']['p2_max'])]);

    var my_sample = [];
    for (var i=0; i<chart_data['xticks'].length; i++) {
        my_sample.push({'x':chart_data['xticks'][i], 'y':chart_data['yticks'][i]});
    }

    yList = my_sample.map(function (a) {
        return a.y;
    });
    xList = my_sample.map(function (a) {
        return a.x;
    });

    const color = '#117D7F';
    const colorScale = d3.scaleLinear()
        .domain([chart_data['minmax']['p1_min'], chart_data['minmax']['p1_max']])
        .range([d3.rgb(color).darker(), d3.rgb(color).brighter()]);

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + yScale(0) + ")")
        .call(d3.axisBottom(xScale))
        .append("text")
        .attr("class", "dotvalue")
        .attr("x", svgWidth)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("PC1");

    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(" + xScale(0) + ",0)")
        .call(d3.axisLeft(yScale))
        .append("text")
        .attr("class", "dotvalue")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("PC2");

    chart.selectAll(".dot")
        .data(my_sample)
        .enter()
        .append("circle")
        .attr("class", "dot")
        .attr("r", 3.5)
        .attr("cx", function(d) { return xScale(d.x); })
        .attr("cy", function(d) { return yScale(d.y); })
        .style("stroke", function(d) { return colorScale(Math.abs(d.x)); })
        .style("fill", function(d) { return colorScale(Math.abs(d.x)); })
        .on('mouseover', function (d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 10.5)
                .style("stroke", '#000')
                .style("fill", '#000');
            chart.append("text")
                .attr('class', 'dotvalue')
                .attr('x', function() {
                    return xScale(d.x+0.06);
                })
                .attr('y', function() {
                    return yScale(d.y);
                })
                .text(function() {
                    return [d.x, d.y];
                });
        })
        .on('mouseout', function () {
            d3.select(this)
                .transition()
                .duration(100)
                .attr("r", 5.0)
                .style("stroke", function(d) { return colorScale(Math.abs(d.x)); })
                .style("fill", function(d) { return colorScale(Math.abs(d.x)); })
            ;
            d3.selectAll('.dotvalue')
                .remove()
        });

    svg.append('text')
        .attr('class', 'title')
        .attr('x', svgWidth / 2 + svgMargin)
        .attr('y', 40)
        .attr('text-anchor', 'middle')
        .text(chart_data['Chart Title']);

}