# agent_workflow.py
from utils.tools import TOOLS, Tool

def run_agent(file_path, file_type):
    # 1. Extract text
    if file_type == 'pdf':
        text = extract_text_from_pdf(file_path)
    elif file_type == 'docx':
        text = extract_text_from_docx(file_path)
    elif file_type == 'image':
        text = extract_text_from_image(file_path)
    else:
        raise ValueError("Unsupported file type")

    # 2. Analyze essay
    grammar = grammar_only_json(text)
    spelling = spelling_only_json(text)
    writing_vocab = vocab_writing_analyzer(text)

    # 3. Generate homework exercises
    # Here you might pass a weakness summary
    weakness_summary = {
        "Grammar": grammar['Grammar_Error_Count'],
        "Spelling": spelling['Misspelled_Count'],
        "Writing": writing_vocab['Writing'],
        "Vocabulary": writing_vocab['Vocabulary']
    }
    exercises = generate_exercises(weakness_summary)

    # 4. Combine into a single JSON
    result_json = {
        "Scores": {
            "Grammar": grammar,
            "Spelling": spelling,
            "Writing": writing_vocab
        },
        "Exercises": exercises
    }

    return result_json
