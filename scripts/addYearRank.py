import pandas as pd
import os

def add_headers(csv_file):
    # Check if the file exists
    if not os.path.isfile(csv_file):
        print("File does not exist.")
        return

    # Read the CSV file
    df = pd.read_csv(csv_file)

    # Check if any of the rank headers already exist
    rank_headers = ['RANK', 'Happiness.Rank', 'Overall rank', 'Happiness Rank']
    rank_header_exists = any(header in df.columns for header in rank_headers)

    # Add "Year" column with the name of the file
    year = os.path.basename(csv_file).split('.')[0]
    df['Year'] = year

    # Add "Rank" column if rank header doesn't exist
    if not rank_header_exists:
        df['Happiness Rank'] = df.index + 1

    # Save the modified DataFrame back to CSV
    output_file = f"{year}cleaned.csv"
    df.to_csv(output_file, index=False)
    print(f"Headers added successfully. Saved as {output_file}")

# Example usage
csv_file = "2022.csv"  # Provide the path to your CSV file here
add_headers(csv_file)
