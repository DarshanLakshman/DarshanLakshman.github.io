class EmptyCodeEditorError(Exception):
    def __init__(self):
        super().__init__("Your code editor is empty. Please provide code for execution.")

class ImportStatementError(Exception):
    def __init__(self):
        super().__init("Import statements are not allowed in this environment. Please remove any 'import' statements from your code.")

class InputFunctionError(Exception):
    def __init__(self):
        super().__init("The 'input' function is not supported here. Remove any 'input' statements from your code.")
