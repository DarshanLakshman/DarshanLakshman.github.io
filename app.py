from flask import Flask, render_template, request, jsonify, send_file
from flaskwebgui import FlaskUI
import pyTracer
import errors

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def main_page():
    return render_template("index.html")


@app.route("/information", methods=["GET", "POST"])
def information():
    return render_template("information.html")


@app.route("/documentation", methods=["GET", "POST"])
def documentation():
    html_content = ""

    with open("templates/documentation.html", "r") as file:
        html_content = file.read()

    return render_template("documentation_display.html", documentation=html_content)


@app.route("/top_to_bottom_veiw", methods=["GET", "POST"])
def top_to_bottom_veiw():
    return render_template("index2.html")


@app.route("/generate_trace", methods=["GET", "POST"])
def generate_trace():
    if request.method == "POST":
        data = request.json
        code = data.get("code")

        try:
            if code.strip().replace("\n", "") == "":
                raise errors.EmptyCodeEditorError()

            if "import " in code:
                raise errors.ImportStatementError()

            if "input(" in code:
                raise errors.InputFunctionError()

            exec(code)

        except Exception as err:
            return jsonify(
                exitCode=-1, error=f" Unexpected: The following exception occured:\n\t {err}"
            )

        print("Received code:", code)
        userCode = pyTracer.CodeTracer(code)
        userCode.generate_trace_table()
        print(userCode.execution_order)
        return jsonify(
            exitCode=0,
            traceTable=(userCode.trace_table),
            executionOrder=(userCode.execution_order),
        )


@app.route("/download_pyTracer_module")
def download_python_file():
    file_path = "pyTracer.py"
    return send_file(file_path, as_attachment=True)


if __name__ == '__main__':
    FlaskUI(app).run()
