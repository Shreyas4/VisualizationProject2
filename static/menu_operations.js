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

function updateChart(chart_data) {
    console.log(chart_data);
}

function updateData(task, datatype) {
    $.post("", {'task': task.value, 'datatype': datatype.value}, function (data_received) {
        updateChart(data_received);
    });
}

updateData({'value': 'screePCA'}, {'value':'og'});