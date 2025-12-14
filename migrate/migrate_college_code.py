#!/usr/bin/env python3
"""
Database migration script to add college_code column to existing tables.
Run this script to migrate the database to support college_code functionality.
"""

from app.db_init import get_connection, execute_query

def migrate_college_code():
    """Add college_code column to existing students and requests tables."""
    
    print("Starting college_code migration...")
    
    try:
        # Add college_code column to students table if it doesn't exist
        execute_query("""
            ALTER TABLE students 
            ADD COLUMN IF NOT EXISTS college_code VARCHAR(20) 
        """)
        print("✓ Added college_code column to students table")
        
        # Add college_code column to requests table if it doesn't exist  
        execute_query("""
            ALTER TABLE requests 
            ADD COLUMN IF NOT EXISTS college_code VARCHAR(20)
        """)
        print("✓ Added college_code column to requests table")
        
        # Update existing students with default college code if any have NULL values
        execute_query("""
            UPDATE students 
            SET college_code = 'CCS' 
            WHERE college_code IS NULL
        """)
        print("✓ Updated existing student records with default college_code")
        
        # Update existing requests with default college code if any have NULL values
        execute_query("""
            UPDATE requests 
            SET college_code = 'CCS'
            WHERE college_code IS NULL
        """)
        print("✓ Updated existing request records with default college_code")
        
        print("College_code migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        raise

if __name__ == "__main__":
    migrate_college_code()
