import os
import jinja2
from weasyprint import HTML
from datetime import datetime
from .chart_generator import create_cost_breakdown_chart

class QuantumRenderingEngine:
    def __init__(self, template_dir: str = "quantum_command_center/templates"):
        self.template_loader = jinja2.FileSystemLoader(searchpath=template_dir)
        self.template_env = jinja2.Environment(loader=self.template_loader)

    def generate_optimization_report(self, optimization_result: dict, travel_id: str) -> str:
        """
        Generates a PDF report from the provided optimization result using the safety_report.html template.
        Includes automated chart generation for visual data analysis.
        """
        try:
            template = self.template_env.get_template("safety_report.html")
            
            # Extract data from optimization result
            data = optimization_result.get("optimizer_output", {})
            data["trip_id"] = travel_id
            data["tenant_id"] = optimization_result.get("tenant_id", "UNKNOWN")
            
            # Enrich data with timestamp if not present
            if "generated_at" not in data:
                data["generated_at"] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            # Generate chart if segments data is available
            output_dir = "quantum_command_center/outputs"
            os.makedirs(output_dir, exist_ok=True)
            
            chart_image_path = None
            if "segments" in data and len(data["segments"]) > 0:
                chart_output_path = f"{output_dir}/chart_{travel_id}.png"
                chart_image_path = create_cost_breakdown_chart(
                    data["segments"], 
                    chart_output_path,
                    title="Trip Cost Breakdown"
                )
                # Make path relative for HTML template
                data["chart_image_path"] = chart_image_path
            
            # Render HTML
            html_content = template.render(**data)
            
            # Generate PDF
            output_path = f"{output_dir}/report_{travel_id}.pdf"
            
            HTML(string=html_content).write_pdf(output_path)
            
            print(f"✅ PDF Generated successfully: {output_path}")
            return output_path
            
        except Exception as e:
            print(f"❌ Error generating PDF: {e}")
            return None

# Test execution
if __name__ == "__main__":
    engine = QuantumRenderingEngine(template_dir="quantum_command_center/templates")
    
    mock_metrics = {
        "trip_name": "Riyadh Safety Optimized",
        "final_cost": 780.50,
        "safe_rationale": "Selected route avoids high-risk zones and prioritizes airlines with top safety ratings. SaRO validation confirmed compliance with corporate travel policy.",
        "segments": [
            {"type": "Flight", "details": "JFK -> RUH (Saudia SV20)", "duration": "12h 30m", "cost": 650.00, "safety_rating": "A+"},
            {"type": "Transfer", "details": "Private Secure Car", "duration": "45m", "cost": 80.50, "safety_rating": "S"},
            {"type": "Hotel", "details": "Ritz-Carlton Riyadh", "duration": "3 Nights", "cost": 50.00, "safety_rating": "A"}
        ]
    }
    
    mock_data = {
        "optimizer_output": mock_metrics,
        "tenant_id": "TENANT-ALPHA-01"
    }
    
    engine.generate_optimization_report(mock_data, "TRIP-2025-X99")
