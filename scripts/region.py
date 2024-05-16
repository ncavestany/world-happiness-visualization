import pandas as pd

def update_csv_with_region(csv_file_with_region, csv_file_to_update):
    # Read both CSV files
    df_region = pd.read_csv(csv_file_with_region)
    df_to_update = pd.read_csv(csv_file_to_update)

    # Merge the two dataframes on 'Country name'
    merged_df = pd.merge(df_to_update, df_region[['Country', 'Region']], on='Country', how='left')

    # Rename the column to 'Regional indicator'
    merged_df.rename(columns={'Region': 'Region'}, inplace=True)

    # Save the updated dataframe to a new CSV file
    merged_df.to_csv('updated_' + csv_file_to_update, index=False)

# Replace 'file_with_region.csv' and 'file_to_update.csv' with your file paths
update_csv_with_region('2022cleaned.csv', '2017cleaned.csv')
