import os
import pandas as pd

def process_csv_files(folder_path):
    # Get list of CSV files in the folder
    csv_files = [file for file in os.listdir(folder_path) if file.endswith('.csv')]
    
    for file in csv_files:
        file_path = os.path.join(folder_path, file)
        
        # Read CSV file into a DataFrame
        df = pd.read_csv(file_path)
        
        # Task 1: Change row named United States to "United States of America"
        df.loc[df['Country'] == 'United States', 'Country'] = 'United States of America'
        
        # Task 2: Remove all periods from the column "Happiness Score"
        df['Happiness Score'] = df['Happiness Score'].str.replace('.', '')
        
        # Task 3: Add zeroes to make sure the Happiness Score is 4 digits
        df['Happiness Score'] = df['Happiness Score'].apply(lambda x: x.zfill(4))
        
        # Write the modified DataFrame back to the CSV file
        df.to_csv(file_path, index=False)
        
        print(f"Processed file: {file}")

# Example usage:
folder_path = '/test'
process_csv_files(folder_path)
