import matplotlib.pyplot as plt
import numpy as np
import re

def generate_radar_chart(weakness_summary, title="Student Weakness Radar Chart", save_path=None):
    """
    Generate a radar chart given the LLM weakness summary string.
    """
    # Extract <attribute> content
    match = re.search(r"<attribute>(.*?)</attribute>", weakness_summary, re.DOTALL)
    if not match:
        raise ValueError("No <attribute> tags found in input")
    
    attribute_content = match.group(1).strip().splitlines()
    
    categories = []
    scores = []
    for line in attribute_content:
        if ':' in line:
            key, value = line.split(':')
            categories.append(key.strip())
            scores.append(int(value.strip()))
    
    # Ensure scores wrap around for closed shape
    scores = scores + scores[:1]
    angles = np.linspace(0, 2 * np.pi, len(categories), endpoint=False).tolist()
    angles += angles[:1]

    # Create figure
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True))
    
    # Plot the radar chart
    ax.plot(angles, scores, 'o-', linewidth=2, label="Score")
    ax.fill(angles, scores, alpha=0.25)

    # Set category labels
    ax.set_thetagrids(np.degrees(angles[:-1]), categories)

    # Set title
    plt.title(title)

    # Optional: save the chart
    if save_path:
        plt.savefig(save_path, bbox_inches='tight')

    # Show chart
    plt.show()


if __name__ == "__main__":
    # Test run with LLM-like string
    test_llm_output = """
    <attribute> 
    Grammar: 3
    Vocabulary: 4 
    Writing Skills: 3
    Spelling: 4
    Punctuation: 4
    </attribute>
    """
    generate_radar_chart(test_llm_output)
