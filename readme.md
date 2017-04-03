---
realgridjs issues search
---

<script>
var __gitpagesize = 100;
var keywords;
var keywordExps;
var fullIssues;
var issues;
var targetIssues;
var selectLabels = [];
var searchOp;
var authorization = "Basic " + btoa("wooriapi:1qazxsw2!@");

$(document).ready( function() {
    buildLabels();
    $("#btnIssueSearch").on("click", function(){
        $("#searchMessage").empty();
        selectLabels = $("#selLabels").val();
        if (!selectLabels) 
            selectLabels = [];
        selectOp = $("#selOperator").val();
        var text = $("#txtQueryString").val();
        keywords = text.split(" ");
        if (keywords[keywords.length-1] == "") {
            keywords = keywords.slice(0, keywords.length-1); // last empty item 
        }
        var state = $("#selState").val();
        keywordExps = [];
        for (var i = 0; i < keywords.length; i++) {
            keywordExps[i] = new RegExp(keywords[i], "gi");
        }
        fullIssues = [];
        issues = [];
        targetIssues = [];
        clearList();
        var includeComment = $("#chkIncludeComment").is(":checked");
        searchIssues(text, state, 0, function() {
            if (includeComment) {
                searchComment(text, 0, function () {
                    resultMessage();
                });
            } else {
                resultMessage();
            }
        });
    })
});

function buildLabels() {
    $("#selLabels").empty();
    $.ajax({
        url: "https://api.github.com/repos/realgrid/realgridjs/labels",
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", authorization); 
        },
        contentType: 'application/json',
        success: function (data) {
            $.each(data, function(i, v) {
                $("#selLabels").append("<option style='background: #" + v.color + "; color: #fff;'>" + v.name + "</option>");
            });
        },
        error: function(xhr, status, error){
          alert("get labels error" + error);
        }
    });
}

function resultMessage() {
    $("#searchMessage").text(targetIssues.length + " issues found.");
}

function searchIssues(text, state, page, done) {
    $.ajax({
        url: "https://api.github.com/repos/realgrid/realgridjs/issues?state=" + state + "&labels=" + selectLabels + "&per_page=" + __gitpagesize + "&page=" + page,
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", authorization); 
        },
        contentType: 'application/json',
        success: function (data) {
            var findFunc = selectOp == "and" ? findAndKeyword : findOrKeyword;
            $.each(data, function(i, v) {
                var results = [];
                if (!v.pull_request) {
                    if (targetIssues.indexOf(v.number) < 0 && findFunc(v.title, v.body)) {
                        results.push(v);
                        targetIssues.push(v.number);
                    }
                    fullIssues.push(v);
                    issues.push(v.number);
                }
                addList(results);
            });
            if (data.length == __gitpagesize) {
                searchIssues(text, state, page + 1, done);
            } else {
                done();
            }
        },
        error: function(xhr, status, error){
          alert("search error" + error);
        }
    });
}

var __issue_url_length = "https://api.github.com/repos/realgrid/realgridjs/issues/".length;

function searchComment(text, page, done) {
    $.ajax({
        url: "https://api.github.com/repos/realgrid/realgridjs/issues/comments?per_page=" + __gitpagesize + "&page=" + page,
        beforeSend: function(xhr) { 
          xhr.setRequestHeader("Authorization", authorization); 
        },
        contentType: 'application/json',
        success: function (data) {
            var findFunc = selectOp == "and" ? findAndKeyword : findOrKeyword;
            $.each(data, function(i, v) {
                var results = [];
                var number = parseInt(v.issue_url.slice(__issue_url_length));
                var issueIndex = issues.indexOf(number);
                var issue;
                if (issueIndex > -1 && targetIssues.indexOf(number) < 0 && findFunc("", v.body)) {
                    issue = fullIssues[issueIndex];
                    issue.searchbyComment = true;
                    results.push(issue);
                    targetIssues.push(issue.number);
                }
                addList(results);
            });
            if (data.length == __gitpagesize) {
                searchComment(text, page + 1, done);
            } else {
                done();
            }
        },
        error: function(xhr, status, error){
          alert("search error" + error);
        }
    });
}

function findAndKeyword(title, body) {
    var len = keywordExps.length;
    if (len == 0) { 
        return true;
    }

    for (var i = 0; i < len; i++) {
        if (title.search(keywordExps[i]) == -1 && body.search(keywordExps[i]) == -1) {
            return false;
        }
    }
    return true;
}

function findOrKeyword(title, body) {
    var len = keywordExps.length;
    if (len == 0) { 
        return true;
    }
    
    for (var i = 0; i < len; i++) {
        if (title.search(keywordExps[i]) != -1 || body.search(keywordExps[i]) != -1) {
            return true;
        }
    }
    return false;
}

function highlightKeyword(content) {
    var highlighted = content;
    for (var i = 0, len = keywordExps.length; i < len; i++) {
        highlighted = highlighted.replace(keywordExps[i], "<mark>"+keywords[i]+"</mark>");
    }
    return highlighted;
}

function clearList() {
    $("#searchResult").empty();
    var thead = $("<thead>");
    var tr = $("<tr>");
    tr.append("<th>No.</th>");
    tr.append("<th>State</th>");
    tr.append("<th>Milestone</th>");
    tr.append("<th>Title</th>");
    tr.append("<th>Comments</th>");
    thead.append(tr);
    $("#searchResult").append(thead);
    $("#searchResult").append("<tbody></tbody>");
}

function addList(list) {
    var tbody = $("#searchResult").find('tbody');
    var no, labels;
    $.each(list, function(i, v) {
        no = "<a href='" + v.html_url + "' target='issue_detail'>" + v.number + "</a>";
        /*
        labels = "";
        $.each(v.labels, function (li, lv) {
            labels += "<span style='background:#" + lv.color + "'>" + lv.name + "</span><br/>";
        });
        */
        var tr = $("<tr>");
        tr.append("<td>" + no + "</td>");
        tr.append("<td>" + v.state + "</td>");
        //$("#searchResult" ).append("<div style='width:150px'>" + labels + "</div>");
        tr.append("<td>" + (v.milestone ? v.milestone.title : " ") + "</td>");
        tr.append("<td style='width:*;white-space: nowrap; text-overflow: ellipsis;'>" + highlightKeyword(v.title) + "</td>");
        tr.append("<td>" + (v.searchbyComment ? v.comments + "(*)" : v.comments) + "</td>");
        tbody.append(tr);
    });
}
</script>

<select id="selLabels" class="selectpicker" multiple title="select labels">
</select>
<select id="selState" class="selectpicker">
  <option selected="selected">all</option>
  <option>open</option>
  <option>closed</option>
</select>
<input type="text" class="form-control input-sm" placeholder="Query string" id="txtQueryString">
<select id="selOperator" title="space operaor(def or)" class="selectpicker">
  <option>or</option>
  <option>and</option>
</select>
<label class="checkbox-inline">
  <input type="checkbox" id="chkIncludeComment"> include comments
</label>
<button type="button" class="btn btn-primary btn-xs" id="btnIssueSearch">Search</button>
<br/>
<table id="searchResult" style="width: 100%;">

</table>
<span id="searchMessage" style="color:green"></span>


