"""
Quantum Chart Generator - Visual Data Analysis Module
Generates dark-themed charts for PDF reports with Cyberpunk aesthetic.
"""

import matplotlib.pyplot as plt
import os
from typing import List, Dict

# Configuration for Dark/Cyberpunk Theme
CYBERPUNK_COLORS = ['#00FFFF', '#00FF00', '#FF00FF', '#FFFF00', '#FF4500', '#1E90FF']
BACKGROUND_COLOR = '#0A0A0A'
TEXT_COLOR = '#D3D3D3'  # Light Grey for visibility
NEON_GLOW_COLOR = '#00FFFF'


def create_cost_breakdown_chart(segments: List[Dict], output_path: str, title: str = "Optimization Cost Breakdown") -> str:
    """
    Generates a dark-themed pie chart showing cost distribution across segments.

    Args:
        segments: List of dictionaries, each with 'type' (label) and 'cost' (value).
        output_path: Full path where the chart image (PNG) will be saved.
        title: The title of the chart.

    Returns:
        The full path to the saved chart image.
    """
    
    # 1. Prepare Data
    try:
        types = [s['type'] for s in segments]
        costs = [s['cost'] for s in segments]
    except KeyError as e:
        print(f"❌ Error in chart data structure: Missing key {e}")
        return ""

    # 2. Configure Matplotlib Dark/Cyberpunk Theme
    plt.style.use('dark_background')
    
    # Create figure and axes
    fig, ax = plt.subplots(figsize=(8, 8), facecolor=BACKGROUND_COLOR)  # Increased size for better PDF quality
    
    # 3. Create Pie Chart
    wedges, texts, autotexts = ax.pie(
        costs, 
        labels=types, 
        autopct='%1.1f%%', 
        colors=CYBERPUNK_COLORS[:len(costs)],  # Use only as many colors as needed
        textprops={'color': TEXT_COLOR, 'fontsize': 12},
        startangle=90,
        wedgeprops={'edgecolor': BACKGROUND_COLOR, 'linewidth': 2}
    )

    # Enhance Text and Title
    ax.set_title(title, color=NEON_GLOW_COLOR, fontsize=18, fontweight='bold', pad=20)
    
    # Make sure text inside slices is visible
    for autotext in autotexts:
        autotext.set_color('white')  # White for contrast
        autotext.set_fontweight('bold')
    
    # Equal aspect ratio ensures that pie is drawn as a circle.
    ax.axis('equal')  

    # 4. Save High-Resolution Image
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    # Save with specific background color and high DPI
    plt.savefig(output_path, dpi=300, facecolor=BACKGROUND_COLOR, bbox_inches='tight')
    plt.close(fig)  # Close figure to free up memory
    
    print(f"✅ Chart generated successfully: {output_path}")
    return output_path


# Example Usage (for testing)
if __name__ == '__main__':
    sample_data = [
        {'type': 'Flight Cost', 'cost': 1500.00},
        {'type': 'Safety Margin', 'cost': 350.00},
        {'type': 'Data Acquisition', 'cost': 150.00},
        {'type': 'Agent Runtime', 'cost': 50.00}
    ]
    output_file = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 
        'outputs', 
        'cost_breakdown_test.png'
    )
    
    print(f"📊 Generating test chart to: {output_file}")
    create_cost_breakdown_chart(sample_data, output_file)
    print("✅ Test chart generation complete.")
