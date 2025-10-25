"""
MapReduce Operations Script for MongoDB Climate Analysis
Performs various MapReduce operations to analyze climate data
"""
import os
import sys
import json
from datetime import datetime
from pymongo import MongoClient
from bson.code import Code

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import MONGO_URI, DATABASE_NAME, COLLECTIONS, OUTPUT_DIR, REPORTS_DIR


class MapReduceAnalyzer:
    """Handles MapReduce operations on climate data"""
    
    def __init__(self):
        """Initialize MongoDB connection"""
        try:
            self.client = MongoClient(MONGO_URI)
            self.db = self.client[DATABASE_NAME]
            print(f"✓ Connected to MongoDB: {DATABASE_NAME}")
            
            # Ensure output directories exist
            os.makedirs(REPORTS_DIR, exist_ok=True)
            
        except Exception as e:
            print(f"✗ Failed to connect to MongoDB: {e}")
            sys.exit(1)
    
    def mapreduce_avg_temp_by_country(self):
        """
        MapReduce: Calculate average temperature by country
        """
        print("\n" + "="*60)
        print("MapReduce #1: Average Temperature by Country")
        print("="*60)
        
        collection = self.db[COLLECTIONS['country']]
        
        # Map function: emit country and temperature
        map_func = Code("""
            function() {
                if (this.Country && this.AverageTemperature) {
                    emit(this.Country, {
                        sum: this.AverageTemperature,
                        count: 1,
                        min: this.AverageTemperature,
                        max: this.AverageTemperature
                    });
                }
            }
        """)
        
        # Reduce function: calculate average, min, max
        reduce_func = Code("""
            function(key, values) {
                var result = {
                    sum: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
                
                values.forEach(function(value) {
                    result.sum += value.sum;
                    result.count += value.count;
                    result.min = Math.min(result.min, value.min);
                    result.max = Math.max(result.max, value.max);
                });
                
                return result;
            }
        """)
        
        # Finalize function: compute average
        finalize_func = Code("""
            function(key, reducedValue) {
                reducedValue.average = reducedValue.sum / reducedValue.count;
                return reducedValue;
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "avg_temp_by_country",
            finalize=finalize_func
        )
        
        # Get results
        results = list(result.find().sort('value.average', -1).limit(20))
        
        print(f"✓ MapReduce completed. Top 20 warmest countries:")
        print(f"\n{'Country':<30} {'Avg Temp (°C)':<15} {'Min (°C)':<12} {'Max (°C)':<12}")
        print("-" * 80)
        
        for doc in results:
            country = doc['_id']
            avg = doc['value']['average']
            min_temp = doc['value']['min']
            max_temp = doc['value']['max']
            print(f"{country:<30} {avg:<15.2f} {min_temp:<12.2f} {max_temp:<12.2f}")
        
        # Save to file
        self._save_results("avg_temp_by_country.json", results)
        
        return results
    
    def mapreduce_temp_trend_by_year(self):
        """
        MapReduce: Calculate average temperature by year (global trend)
        """
        print("\n" + "="*60)
        print("MapReduce #2: Global Temperature Trend by Year")
        print("="*60)
        
        collection = self.db[COLLECTIONS['country']]
        
        # Map function
        map_func = Code("""
            function() {
                if (this.year && this.AverageTemperature) {
                    emit(this.year, {
                        sum: this.AverageTemperature,
                        count: 1
                    });
                }
            }
        """)
        
        # Reduce function
        reduce_func = Code("""
            function(key, values) {
                var result = {sum: 0, count: 0};
                values.forEach(function(value) {
                    result.sum += value.sum;
                    result.count += value.count;
                });
                return result;
            }
        """)
        
        # Finalize function
        finalize_func = Code("""
            function(key, reducedValue) {
                reducedValue.average = reducedValue.sum / reducedValue.count;
                return reducedValue;
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "temp_trend_by_year",
            finalize=finalize_func
        )
        
        # Get results
        results = list(result.find().sort('_id', 1))
        
        print(f"✓ MapReduce completed. Showing sample years:")
        print(f"\n{'Year':<10} {'Avg Temp (°C)':<15} {'Records':<10}")
        print("-" * 40)
        
        # Show every 10th year
        for i, doc in enumerate(results):
            if i % 10 == 0 or i == len(results) - 1:
                year = doc['_id']
                avg = doc['value']['average']
                count = doc['value']['count']
                print(f"{year:<10} {avg:<15.2f} {count:<10}")
        
        # Save to file
        self._save_results("temp_trend_by_year.json", results)
        
        return results
    
    def mapreduce_seasonal_temps(self):
        """
        MapReduce: Calculate average temperature by season
        """
        print("\n" + "="*60)
        print("MapReduce #3: Average Temperature by Season")
        print("="*60)
        
        collection = self.db[COLLECTIONS['country']]
        
        # Map function: classify months into seasons
        map_func = Code("""
            function() {
                if (this.month && this.AverageTemperature) {
                    var season;
                    var month = this.month;
                    
                    if (month >= 3 && month <= 5) {
                        season = "Spring";
                    } else if (month >= 6 && month <= 8) {
                        season = "Summer";
                    } else if (month >= 9 && month <= 11) {
                        season = "Fall";
                    } else {
                        season = "Winter";
                    }
                    
                    emit(season, {
                        sum: this.AverageTemperature,
                        count: 1
                    });
                }
            }
        """)
        
        # Reduce function
        reduce_func = Code("""
            function(key, values) {
                var result = {sum: 0, count: 0};
                values.forEach(function(value) {
                    result.sum += value.sum;
                    result.count += value.count;
                });
                return result;
            }
        """)
        
        # Finalize function
        finalize_func = Code("""
            function(key, reducedValue) {
                reducedValue.average = reducedValue.sum / reducedValue.count;
                return reducedValue;
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "seasonal_temps",
            finalize=finalize_func
        )
        
        # Get results
        results = list(result.find())
        
        print(f"✓ MapReduce completed. Seasonal averages:")
        print(f"\n{'Season':<15} {'Avg Temp (°C)':<15} {'Records':<10}")
        print("-" * 45)
        
        season_order = ["Spring", "Summer", "Fall", "Winter"]
        for season in season_order:
            for doc in results:
                if doc['_id'] == season:
                    avg = doc['value']['average']
                    count = doc['value']['count']
                    print(f"{season:<15} {avg:<15.2f} {count:<10}")
        
        # Save to file
        self._save_results("seasonal_temps.json", results)
        
        return results
    
    def mapreduce_city_temperature_ranking(self):
        """
        MapReduce: Rank major cities by average temperature
        """
        print("\n" + "="*60)
        print("MapReduce #4: Major Cities Temperature Ranking")
        print("="*60)
        
        collection = self.db[COLLECTIONS['major_city']]
        
        if collection.count_documents({}) == 0:
            print("⚠ Major city collection is empty, skipping...")
            return []
        
        # Map function
        map_func = Code("""
            function() {
                if (this.City && this.Country && this.AverageTemperature) {
                    var key = this.City + ", " + this.Country;
                    emit(key, {
                        sum: this.AverageTemperature,
                        count: 1,
                        min: this.AverageTemperature,
                        max: this.AverageTemperature
                    });
                }
            }
        """)
        
        # Reduce function
        reduce_func = Code("""
            function(key, values) {
                var result = {
                    sum: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
                
                values.forEach(function(value) {
                    result.sum += value.sum;
                    result.count += value.count;
                    result.min = Math.min(result.min, value.min);
                    result.max = Math.max(result.max, value.max);
                });
                
                return result;
            }
        """)
        
        # Finalize function
        finalize_func = Code("""
            function(key, reducedValue) {
                reducedValue.average = reducedValue.sum / reducedValue.count;
                reducedValue.range = reducedValue.max - reducedValue.min;
                return reducedValue;
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "city_temp_ranking",
            finalize=finalize_func
        )
        
        # Get results - top 15 warmest and coldest
        warmest = list(result.find().sort('value.average', -1).limit(15))
        coldest = list(result.find().sort('value.average', 1).limit(15))
        
        print(f"✓ MapReduce completed.\n")
        
        print("Top 15 WARMEST Cities:")
        print(f"{'City, Country':<40} {'Avg (°C)':<12} {'Range (°C)':<12}")
        print("-" * 70)
        for doc in warmest:
            city = doc['_id']
            avg = doc['value']['average']
            temp_range = doc['value']['range']
            print(f"{city:<40} {avg:<12.2f} {temp_range:<12.2f}")
        
        print(f"\nTop 15 COLDEST Cities:")
        print(f"{'City, Country':<40} {'Avg (°C)':<12} {'Range (°C)':<12}")
        print("-" * 70)
        for doc in coldest:
            city = doc['_id']
            avg = doc['value']['average']
            temp_range = doc['value']['range']
            print(f"{city:<40} {avg:<12.2f} {temp_range:<12.2f}")
        
        # Save to file
        self._save_results("city_temp_ranking_warmest.json", warmest)
        self._save_results("city_temp_ranking_coldest.json", coldest)
        
        return {'warmest': warmest, 'coldest': coldest}
    
    def mapreduce_records_count_by_country(self):
        """
        MapReduce: Count number of temperature records by country
        """
        print("\n" + "="*60)
        print("MapReduce #5: Record Count by Country")
        print("="*60)
        
        collection = self.db[COLLECTIONS['country']]
        
        # Map function
        map_func = Code("""
            function() {
                if (this.Country) {
                    emit(this.Country, 1);
                }
            }
        """)
        
        # Reduce function
        reduce_func = Code("""
            function(key, values) {
                return Array.sum(values);
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "records_by_country"
        )
        
        # Get results
        results = list(result.find().sort('value', -1).limit(20))
        
        print(f"✓ MapReduce completed. Top 20 countries by record count:")
        print(f"\n{'Country':<35} {'Record Count':<15}")
        print("-" * 55)
        
        for doc in results:
            country = doc['_id']
            count = int(doc['value'])
            print(f"{country:<35} {count:<15,}")
        
        # Save to file
        self._save_results("records_by_country.json", results)
        
        return results
    
    def mapreduce_decade_analysis(self):
        """
        MapReduce: Analyze temperature changes by decade
        """
        print("\n" + "="*60)
        print("MapReduce #6: Temperature Analysis by Decade")
        print("="*60)
        
        collection = self.db[COLLECTIONS['country']]
        
        # Map function: group by decade
        map_func = Code("""
            function() {
                if (this.year && this.AverageTemperature) {
                    var decade = Math.floor(this.year / 10) * 10;
                    emit(decade, {
                        sum: this.AverageTemperature,
                        count: 1,
                        min: this.AverageTemperature,
                        max: this.AverageTemperature
                    });
                }
            }
        """)
        
        # Reduce function
        reduce_func = Code("""
            function(key, values) {
                var result = {
                    sum: 0,
                    count: 0,
                    min: Infinity,
                    max: -Infinity
                };
                
                values.forEach(function(value) {
                    result.sum += value.sum;
                    result.count += value.count;
                    result.min = Math.min(result.min, value.min);
                    result.max = Math.max(result.max, value.max);
                });
                
                return result;
            }
        """)
        
        # Finalize function
        finalize_func = Code("""
            function(key, reducedValue) {
                reducedValue.average = reducedValue.sum / reducedValue.count;
                return reducedValue;
            }
        """)
        
        # Execute MapReduce
        result = collection.map_reduce(
            map_func,
            reduce_func,
            "decade_analysis",
            finalize=finalize_func
        )
        
        # Get results
        results = list(result.find().sort('_id', 1))
        
        print(f"✓ MapReduce completed. Decade-wise temperature trends:")
        print(f"\n{'Decade':<10} {'Avg (°C)':<12} {'Min (°C)':<12} {'Max (°C)':<12} {'Records':<12}")
        print("-" * 65)
        
        for doc in results:
            decade = doc['_id']
            avg = doc['value']['average']
            min_temp = doc['value']['min']
            max_temp = doc['value']['max']
            count = doc['value']['count']
            print(f"{decade}s{'':<5} {avg:<12.2f} {min_temp:<12.2f} {max_temp:<12.2f} {count:<12}")
        
        # Save to file
        self._save_results("decade_analysis.json", results)
        
        return results
    
    def run_all_mapreduce(self):
        """Execute all MapReduce operations"""
        print("\n" + "="*60)
        print("MAPREDUCE ANALYSIS - CLIMATE DATA PROJECT")
        print("="*60)
        
        results = {}
        
        try:
            results['avg_by_country'] = self.mapreduce_avg_temp_by_country()
            results['temp_trend'] = self.mapreduce_temp_trend_by_year()
            results['seasonal'] = self.mapreduce_seasonal_temps()
            results['city_ranking'] = self.mapreduce_city_temperature_ranking()
            results['record_count'] = self.mapreduce_records_count_by_country()
            results['decade_analysis'] = self.mapreduce_decade_analysis()
            
            print("\n" + "="*60)
            print("✓ ALL MAPREDUCE OPERATIONS COMPLETED SUCCESSFULLY!")
            print(f"Results saved to: {REPORTS_DIR}")
            print("="*60 + "\n")
            
        except Exception as e:
            print(f"\n✗ Error during MapReduce operations: {e}")
        
        return results
    
    def _save_results(self, filename, data):
        """Save MapReduce results to JSON file"""
        filepath = os.path.join(REPORTS_DIR, filename)
        
        # Convert MongoDB documents to JSON-serializable format
        json_data = []
        for doc in data:
            json_doc = {
                'key': doc['_id'],
                'value': doc['value']
            }
            json_data.append(json_doc)
        
        with open(filepath, 'w') as f:
            json.dump(json_data, f, indent=2, default=str)
        
        print(f"   ✓ Results saved to: {filename}")
    
    def close(self):
        """Close MongoDB connection"""
        self.client.close()
        print("✓ MongoDB connection closed")


def main():
    """Main execution function"""
    analyzer = MapReduceAnalyzer()
    
    try:
        analyzer.run_all_mapreduce()
        return 0
    except KeyboardInterrupt:
        print("\n\n✗ Analysis interrupted by user")
        return 1
    finally:
        analyzer.close()


if __name__ == "__main__":
    sys.exit(main())
