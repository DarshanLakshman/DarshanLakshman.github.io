document.addEventListener("DOMContentLoaded", function () {
    const sidebarToggle = document.getElementById("sidebarToggle");
    const sidebar = document.getElementById("sidebar");
    const runButton = document.getElementById("runButton");
    const resultContainer = document.getElementById("resultContainer");
    const nextButton = document.getElementById("nextButton");
    const outputTab = document.getElementById("outputTab");
    const python3Tab = document.getElementById("python3Tab");

    const codeEditor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
        lineNumbers: true,
        theme: "dracula",
        mode: "python",
        readOnly: false,
        inputStyle: "contenteditable", 
    });

    const appData = {
        currentRowTracker : 0,
        traceTable : [],
        executionOrder : []
    };

    let isDragging = false;
    let initialX;
    let offsetX = 0;

    resultContainer.addEventListener("mousedown", function (event) {
        isDragging = true;
        initialX = event.clientX;
        offsetX = resultContainer.scrollLeft - initialX;  
    });

    document.addEventListener("mousemove", function (event) {
        if (!isDragging) return;

        const newX = event.clientX + offsetX;
        resultContainer.scrollLeft = newX; 
    });

    document.addEventListener("mouseup", function () {
        isDragging = false;
    });

    sidebarToggle.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        updateToggleIconAndEditor();
    });
    

    runButton.addEventListener("click", async function () {

        appData.currentRowTracker = 0;
        appData.executionOrder = [];
        appData.traceTable = [];

        const code = codeEditor.getValue();

        const response = await fetch('/generate_trace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ code })
        });
    
        const result = await response.json();
        
        if (result.exitCode === -1) {
            resultContainer.style.color = "red";
            resultContainer.innerHTML = '<pre>' + result.error + "</pre>";
            runButton.disabled = false;
            return;
        } else {
            resultContainer.style.color = "white";
        }

        appData.traceTable = result.traceTable;
        appData.executionOrder = result.executionOrder;
        console.log(result.executionOrder);
    
        runButton.disabled = true;
        codeEditor.readOnly = true;

        nextButton.style.backgroundColor = "green"
        nextButton.disabled = false;
    
        let tableHTML = '<table class="traceTable"><tr>';
        
        result.traceTable[0].forEach(header => {
            tableHTML += '\n\t<th>' + header + '</th>';
        });
        tableHTML += '\n</tr>\n';

        tableHTML += '\n</table>';
        resultContainer.innerHTML = tableHTML;
    });
    
    nextButton.addEventListener("click", function() {
        appData.currentRowTracker++;

        totalLines = codeEditor.lineCount();
        for (let currLineNumber = 0; currLineNumber < totalLines; currLineNumber++) {
            codeEditor.removeLineClass(currLineNumber, 'background', 'highlighted-line');
        }

        if (appData.currentRowTracker === (appData.traceTable.length)){
            nextButton.innerHTML = `<i class="fa-solid fa-flag-checkered"></i>&nbspFinish`
        }
        
        if (appData.currentRowTracker === (appData.traceTable.length + 1)){
            nextButton.disabled = true;
            runButton.disabled = false;
            codeEditor.readOnly = false; 
            codeEditor.inputStyle = "contenteditable";
            if (window.location.pathname === '/top_to_bottom_veiw') {
                nextButton.innerHTML = `<i class="fas fa-forward"></i>&nbsp;Next&nbsp;&nbsp;`
            }
            if (window.location.pathname === '/') {
                nextButton.innerHTML = `<i class="fas fa-forward"></i>&nbsp;Next`
            }

            resultContainer.innerHTML = "";
            return;
        }

        const lineNumber = appData.executionOrder[appData.currentRowTracker - 1] - 1

        if (lineNumber >= 0 && lineNumber < totalLines) {
            codeEditor.addLineClass(lineNumber, 'background', 'highlighted-line');
        }

        currentHTML = resultContainer.innerHTML;
        document.querySelectorAll('.highlight-green').forEach(el => el.classList.remove('highlight-green'));
        currentHTML = currentHTML.replace("</table>", '');
        currentHTML += '\n<tr>';

        let previousRow = appData.traceTable[appData.currentRowTracker - 1];
        let currentRow = appData.traceTable[appData.currentRowTracker];

        for (let index = 0; index < currentRow.length; index++) {
            const previousValue = previousRow[index];
            const currentValue = currentRow[index];
            const isValueChanged = previousValue !== currentValue && currentValue != "";

            const cellClass = isValueChanged ? 'highlight-green' : '';

            currentHTML += `\n\t<td class="${cellClass}">${currentValue}</td>`;
        }

        currentHTML += '\n</tr>\n';

        currentHTML += '\n</table>';
        resultContainer.innerHTML = currentHTML;



    });

    function updateToggleIconAndEditor() {
        const codeEditorContainer = document.querySelector(".CodeMirror");
        const outputWindow = document.querySelector(".scrollable-div");
        const icon = sidebar.classList.contains("active") ? "bars" : "times";
        sidebarToggle.innerHTML = `<i class="fas fa-${icon}"></i>`;

        if (sidebar.classList.contains("active")) {
            codeEditorContainer.style.width = "625px";
            outputWindow.style.width = "625px";
            outputWindow.style.marginLeft = "20px";

            if (window.location.pathname === '/') {
                const outputTab = document.getElementById('outputTab');
                outputTab.style.width = '500px';
                const python3Tab = document.getElementById('python3Tab');
                python3Tab.style.width = '540px';
            }
        } else {
            codeEditorContainer.style.width = "500px";
            outputWindow.style.width = "500px";
            outputWindow.style.marginLeft = "20px";
            if (window.location.pathname === '/') {
                const outputTab = document.getElementById('outputTab');
                outputTab.style.width = '400px';
                const python3Tab = document.getElementById('python3Tab');
                python3Tab.style.width = '400px';
            }
            
        }

        codeEditor.setSize(null, codeEditorContainer.clientHeight);
    }

    updateToggleIconAndEditor();

    function updateOutputTabWidth(){ 
        let currentWidthString = window.getComputedStyle(resultContainer).getPropertyValue('width');
        let currentWidth = parseInt(currentWidthString);
        let newWidth = currentWidth;
        outputTab.style.width = `${newWidth}px`;
    }

    resultContainer.addEventListener('resize', updateOutputTabWidth);

    async function getRequest(url = '') {
        const response = await fetch(url, {
            method: 'GET',
            cache: 'no-cache'
        })
        return response.json()
    }
    document.addEventListener('DOMContentLoaded', function () {
        let url = document.location
        let route = "/flaskwebgui-keep-server-alive"
        let interval_request = 3 * 1000 //sec
        function keep_alive_server() {
            getRequest(url + route)
                .then(data => console.log(data))
        }
        setInterval(keep_alive_server, interval_request)()
    })

      

});
