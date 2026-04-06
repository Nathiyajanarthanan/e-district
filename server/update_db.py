import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'edistrict.db')

try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check if category column already exists to prevent error on re-runs
    cursor.execute("PRAGMA table_info(services)")
    columns = [col[1] for col in cursor.fetchall()]
    
    if "category" not in columns:
        print("Adding 'category' column to 'services' table...")
        cursor.execute("ALTER TABLE services ADD COLUMN category VARCHAR(100) DEFAULT 'Uncategorized'")
        conn.commit()
    else:
        print("'category' column already exists.")

    # Seed predefined services with categories
    print("Seed some standard services...")
    services = [
        ("Income Certificate", "Official proof of annual income.", "Personal & Identity Certificates"),
        ("Caste Certificate", "Documentation for reserved category benefits.", "Personal & Identity Certificates"),
        ("Birth Certificate", "Official record of birth.", "Vital Records"),
        ("Death Certificate", "Official record of death.", "Vital Records"),
        ("Marriage Certificate", "Legal proof of marriage.", "Family & Relationship Certificates"),
        ("Senior Citizen Certificate", "Benefits for senior citizens.", "Social Welfare Certificates"),
        ("Widow Pension", "Financial assistance for widows.", "Social Welfare Certificates"),
        ("Solvency Certificate", "Proof of financial stability.", "Property & Financial Certificates"),
        ("Legal Heir Certificate", "Proof of inheritance.", "Family & Relationship Certificates"),
        ("Disability Certificate", "Official certification of disability.", "Special Case Certificates")
    ]

    for name, desc, category in services:
        # check if exists
        cursor.execute("SELECT id FROM services WHERE name = ?", (name,))
        if not cursor.fetchone():
            cursor.execute(
                "INSERT INTO services (name, description, category, required_documents, fee) VALUES (?, ?, ?, ?, ?)",
                (name, desc, category, "Aadhar Card, Photo", 50.0)
            )
            
    # update old ones to a default category if 'Uncategorized'
    cursor.execute("UPDATE services SET category = 'Personal & Identity Certificates' WHERE category = 'Uncategorized' OR category IS NULL")
            
    conn.commit()
    conn.close()
    print("Database updated and seeded.")

except Exception as e:
    print(f"Error: {e}")
