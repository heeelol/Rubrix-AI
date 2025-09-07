class Tool:
    def __init__(self, name, function, description, input_type, output_type):
        self.name = name               # e.g., "Grammar Checker"
        self.function = function       # reference to Python function
        self.description = description # short explanation
        self.input_type = input_type   # e.g., 'text'
        self.output_type = output_type # e.g., JSON/dict


from input_extraction import convert_pdf_to_string, convert_png_to_string

TOOLS = [
    Tool(
        name="PDF Extractor",
        function=convert_pdf_to_string,
        description="Extract text from PDF files",
        input_type="file_path",
        output_type="text"
    ),
    Tool(
        name="PNG Extractor",
        function=convert_png_to_string,
        description="Extract text from Word documents",
        input_type="file_path",
        output_type="text"
    )
]
