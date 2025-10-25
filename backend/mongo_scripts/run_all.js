// Run all MapReduce operations

print("\n" + "=".repeat(70));
print("MONGODB MAPREDUCE - CLIMATE ANALYSIS PROJECT");
print("=".repeat(70));
print("\nRunning all MapReduce operations...\n");

load("1_avg_temp_by_country.js");
load("2_temp_trends_by_year.js");
load("3_seasonal_analysis.js");
load("4_extreme_temps.js");
load("5_decade_analysis.js");
load("6_records_by_country.js");

print("\n" + "=".repeat(70));
print("ALL MAPREDUCE OPERATIONS COMPLETED SUCCESSFULLY");
print("=".repeat(70));
print("\nOutput Collections Created:");
print("  1. avg_temp_by_country    - Average temperatures by country");
print("  2. temp_trends_by_year    - Yearly temperature trends");
print("  3. seasonal_analysis      - Seasonal temperature patterns");
print("  4. extreme_temps          - Extreme temperature records");
print("  5. decade_analysis        - Temperature by decade");
print("  6. records_by_country     - Record count by country");
print("\nNext step: Run Python script to fetch and analyze results");
print("  $ cd ..");
print("  $ python scripts/mapreduce_operations.py");
print("=".repeat(70) + "\n");
