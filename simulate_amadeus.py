import time
import json
import random

class AmadeusCacher:
    def __init__(self):
        self.cache = {}
        print("✅ Amadeus Cacher Initialized")

    def search_flights(self, origin, destination, date):
        print(f"🔎 Searching flights: {origin} -> {destination} on {date}")
        time.sleep(1) # Simulate API latency
        
        # Mock Amadeus API response
        flight_id = f"FL-{random.randint(1000, 9999)}"
        price = random.randint(300, 900)
        flight_data = {
            "id": flight_id,
            "origin": origin,
            "destination": destination,
            "date": date,
            "price": price,
            "airline": random.choice(["Qatar Airways", "Emirates", "Lufthansa"]),
            "timestamp": time.time()
        }
        
        self.cache[flight_id] = flight_data
        print(f"💾 Cached Result: {flight_id} | ${price}")
        return flight_data

    def generate_pdf(self, flight_id):
        if flight_id not in self.cache:
            print(f"❌ Error: Flight {flight_id} not found in cache")
            return None
        
        print(f"📄 Generating PDF for {flight_id}...")
        time.sleep(0.5)
        # Simulate PDF generation
        pdf_path = f"/tmp/{flight_id}.pdf"
        print(f"✅ PDF Generated: {pdf_path}")
        return pdf_path

    def notify_user(self, flight_data, pdf_path):
        print(f"📧 Sending Notification for {flight_data['id']}...")
        print(f"   Subject: Flight Found: {flight_data['origin']} to {flight_data['destination']}")
        print(f"   Attachment: {pdf_path}")
        print("✅ Notification Sent")

def run_e2e_test():
    print("🚀 Starting End-to-End Test: Amadeus Workflow")
    print("------------------------------------------------")
    
    cacher = AmadeusCacher()
    
    # Step 1: Search
    flight = cacher.search_flights("JFK", "LHR", "2025-12-01")
    
    # Step 2: Generate PDF
    pdf = cacher.generate_pdf(flight["id"])
    
    # Step 3: Notify
    if pdf:
        cacher.notify_user(flight, pdf)
        
    print("------------------------------------------------")
    print("✅ E2E Test Completed Successfully")

if __name__ == "__main__":
    run_e2e_test()
