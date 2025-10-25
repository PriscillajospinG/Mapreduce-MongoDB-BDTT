""""""

Fetch MapReduce Results from MongoDBFetch MapReduce Results from MongoDB

This script ONLY fetches results from MapReduce operations run in MongoDB shellThis script ONLY fetches results from MapReduce operations run in MongoDB shell

Run MapReduce operations first using: mongosh < mongo_scripts/run_all.jsRun MapReduce operations first using: mongosh < mongo_scripts/run_all.js

""""""

import osimport os

import sysimport sys

import jsonimport json

from datetime import datetimefrom datetime import datetime

from pymongo import MongoClientfrom pymongo import MongoClient



sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config import MONGO_URI, DATABASE_NAME, OUTPUT_DIR, REPORTS_DIRfrom config import MONGO_URI, DATABASE_NAME, OUTPUT_DIR, REPORTS_DIR





class MapReduceResultsFetcher:class MapReduceResultsFetcher:

    """Fetches and exports MapReduce results from MongoDB"""    """Handles MapReduce operations on climate data"""

        

    # MapReduce output collections created by mongo shell scripts    def __init__(self):

    MR_COLLECTIONS = {        """Initialize MongoDB connection"""

        'avg_temp_by_country': 'Average Temperature by Country',        try:

        'temp_trends_by_year': 'Temperature Trends by Year',            self.client = MongoClient(MONGO_URI)

        'seasonal_analysis': 'Seasonal Temperature Analysis',            self.db = self.client[DATABASE_NAME]

        'extreme_temps': 'Extreme Temperature Records',            print(f"✓ Connected to MongoDB: {DATABASE_NAME}")

        'decade_analysis': 'Temperature by Decade',            

        'records_by_country': 'Record Count by Country'            # Ensure output directories exist

    }            os.makedirs(REPORTS_DIR, exist_ok=True)

                

    def __init__(self):        except Exception as e:

        """Initialize MongoDB connection"""            print(f"✗ Failed to connect to MongoDB: {e}")

        try:            sys.exit(1)

            self.client = MongoClient(MONGO_URI)    

            self.db = self.client[DATABASE_NAME]    def mapreduce_avg_temp_by_country(self):

            print(f"✓ Connected to MongoDB: {DATABASE_NAME}")        """

                    MapReduce: Calculate average temperature by country

            # Ensure output directories exist        """

            os.makedirs(REPORTS_DIR, exist_ok=True)        print("\n" + "="*60)

                    print("MapReduce #1: Average Temperature by Country")

        except Exception as e:        print("="*60)

            print(f"✗ Failed to connect to MongoDB: {e}")        

            sys.exit(1)        collection = self.db[COLLECTIONS['country']]

            

    def fetch_results(self, collection_name, description):        # Map function: emit country and temperature

        """        map_func = Code("""

        Fetch MapReduce results from a collection            function() {

                        if (this.Country && this.AverageTemperature) {

        Args:                    emit(this.Country, {

            collection_name: Name of the MapReduce output collection                        sum: this.AverageTemperature,

            description: Human-readable description                        count: 1,

        """                        min: this.AverageTemperature,

        print(f"\n{'='*60}")                        max: this.AverageTemperature

        print(f"{description}")                    });

        print(f"Collection: {collection_name}")                }

        print(f"{'='*60}")            }

                """)

        # Check if collection exists        

        if collection_name not in self.db.list_collection_names():        # Reduce function: calculate average, min, max

            print(f"✗ Collection '{collection_name}' not found!")        reduce_func = Code("""

            print(f"  Run MapReduce operations first:")            function(key, values) {

            print(f"  mongosh < mongo_scripts/run_all.js")                var result = {

            return None                    sum: 0,

                            count: 0,

        collection = self.db[collection_name]                    min: Infinity,

        count = collection.count_documents({})                    max: -Infinity

                        };

        if count == 0:                

            print(f"⚠ Collection is empty")                values.forEach(function(value) {

            return None                    result.sum += value.sum;

                            result.count += value.count;

        # Fetch all results                    result.min = Math.min(result.min, value.min);

        results = list(collection.find())                    result.max = Math.max(result.max, value.max);

        print(f"✓ Fetched {count:,} results")                });

                        

        # Display sample results                return result;

        self._display_sample(collection_name, results)            }

                """)

        # Save to JSON        

        filename = f"{collection_name}.json"        # Finalize function: compute average

        self._save_to_json(results, filename)        finalize_func = Code("""

                    function(key, reducedValue) {

        return results                reducedValue.average = reducedValue.sum / reducedValue.count;

                    return reducedValue;

    def _display_sample(self, collection_name, results, limit=10):            }

        """Display sample results in console"""        """)

        print(f"\nSample results (showing up to {limit}):")        

        print("-" * 60)        # Execute MapReduce

                result = collection.map_reduce(

        for i, doc in enumerate(results[:limit]):            map_func,

            # Format output based on collection type            reduce_func,

            if collection_name == 'avg_temp_by_country':            "avg_temp_by_country",

                country = doc['_id']            finalize=finalize_func

                avg = doc['value']['average']        )

                min_temp = doc['value']['min']        

                max_temp = doc['value']['max']        # Get results

                print(f"{i+1:2d}. {country:<30} Avg: {avg:>6.2f}°C  Min: {min_temp:>6.2f}°C  Max: {max_temp:>6.2f}°C")        results = list(result.find().sort('value.average', -1).limit(20))

                    

            elif collection_name == 'temp_trends_by_year':        print(f"✓ MapReduce completed. Top 20 warmest countries:")

                year = doc['_id']        print(f"\n{'Country':<30} {'Avg Temp (°C)':<15} {'Min (°C)':<12} {'Max (°C)':<12}")

                avg = doc['value']['average']        print("-" * 80)

                count = doc['value']['count']        

                print(f"{i+1:2d}. Year {year}:  Avg: {avg:>6.2f}°C  Records: {count:>8,}")        for doc in results:

                        country = doc['_id']

            elif collection_name == 'seasonal_analysis':            avg = doc['value']['average']

                season = doc['_id']            min_temp = doc['value']['min']

                avg = doc['value']['average']            max_temp = doc['value']['max']

                count = doc['value']['count']            print(f"{country:<30} {avg:<15.2f} {min_temp:<12.2f} {max_temp:<12.2f}")

                print(f"{i+1:2d}. {season:<10}  Avg: {avg:>6.2f}°C  Records: {count:>10,}")        

                    # Save to file

            elif collection_name == 'extreme_temps':        self._save_results("avg_temp_by_country.json", results)

                country = doc['_id']        

                max_temp = doc['value']['maxTemp']        return results

                min_temp = doc['value']['minTemp']    

                temp_range = doc['value']['tempRange']    def mapreduce_temp_trend_by_year(self):

                print(f"{i+1:2d}. {country:<25}  Max: {max_temp:>6.2f}°C  Min: {min_temp:>6.2f}°C  Range: {temp_range:>6.2f}°C")        """

                    MapReduce: Calculate average temperature by year (global trend)

            elif collection_name == 'decade_analysis':        """

                decade = doc['_id']        print("\n" + "="*60)

                avg = doc['value']['average']        print("MapReduce #2: Global Temperature Trend by Year")

                temp_range = doc['value']['range']        print("="*60)

                print(f"{i+1:2d}. {decade}s:  Avg: {avg:>6.2f}°C  Range: {temp_range:>6.2f}°C")        

                    collection = self.db[COLLECTIONS['country']]

            elif collection_name == 'records_by_country':        

                country = doc['_id']        # Map function

                count = int(doc['value'])        map_func = Code("""

                print(f"{i+1:2d}. {country:<30} Records: {count:>8,}")            function() {

                            if (this.year && this.AverageTemperature) {

            else:                    emit(this.year, {

                # Generic display                        sum: this.AverageTemperature,

                print(f"{i+1:2d}. {json.dumps(doc, default=str)}")                        count: 1

                            });

        if len(results) > limit:                }

            print(f"... and {len(results) - limit} more results")            }

            """)

    def _save_to_json(self, results, filename):        

        """Save results to JSON file"""        # Reduce function

        filepath = os.path.join(REPORTS_DIR, filename)        reduce_func = Code("""

                    function(key, values) {

        # Convert MongoDB documents to JSON-serializable format                var result = {sum: 0, count: 0};

        json_data = []                values.forEach(function(value) {

        for doc in results:                    result.sum += value.sum;

            # Convert ObjectId to string                    result.count += value.count;

            if '_id' in doc:                });

                doc['_id'] = str(doc['_id']) if not isinstance(doc['_id'], (str, int)) else doc['_id']                return result;

            json_data.append(doc)            }

                """)

        with open(filepath, 'w') as f:        

            json.dump(json_data, f, indent=2, default=str)        # Finalize function

                finalize_func = Code("""

        print(f"✓ Results saved to: {filename}")            function(key, reducedValue) {

                    reducedValue.average = reducedValue.sum / reducedValue.count;

    def fetch_all_results(self):                return reducedValue;

        """Fetch all MapReduce results"""            }

        print("\n" + "="*60)        """)

        print("FETCHING MAPREDUCE RESULTS FROM MONGODB")        

        print("="*60)        # Execute MapReduce

                result = collection.map_reduce(

        results_summary = {}            map_func,

                    reduce_func,

        for collection_name, description in self.MR_COLLECTIONS.items():            "temp_trend_by_year",

            results = self.fetch_results(collection_name, description)            finalize=finalize_func

            if results:        )

                results_summary[collection_name] = {        

                    'count': len(results),        # Get results

                    'description': description        results = list(result.find().sort('_id', 1))

                }        

                print(f"✓ MapReduce completed. Showing sample years:")

        # Generate summary report        print(f"\n{'Year':<10} {'Avg Temp (°C)':<15} {'Records':<10}")

        self._generate_summary(results_summary)        print("-" * 40)

                

        print("\n" + "="*60)        # Show every 10th year

        print("✓ ALL RESULTS FETCHED SUCCESSFULLY!")        for i, doc in enumerate(results):

        print(f"Results saved to: {REPORTS_DIR}")            if i % 10 == 0 or i == len(results) - 1:

        print("="*60 + "\n")                year = doc['_id']

                        avg = doc['value']['average']

        return results_summary                count = doc['value']['count']

                    print(f"{year:<10} {avg:<15.2f} {count:<10}")

    def _generate_summary(self, results_summary):        

        """Generate a summary report"""        # Save to file

        print(f"\n{'='*60}")        self._save_results("temp_trend_by_year.json", results)

        print("SUMMARY REPORT")        

        print(f"{'='*60}")        return results

            

        if not results_summary:    def mapreduce_seasonal_temps(self):

            print("⚠ No MapReduce results found!")        """

            print("\nTo generate results, run:")        MapReduce: Calculate average temperature by season

            print("  cd mongo_scripts")        """

            print("  mongosh < run_all.js")        print("\n" + "="*60)

            return        print("MapReduce #3: Average Temperature by Season")

                print("="*60)

        print(f"\nMapReduce Collections Fetched: {len(results_summary)}\n")        

                collection = self.db[COLLECTIONS['country']]

        for collection_name, info in results_summary.items():        

            print(f"✓ {info['description']}")        # Map function: classify months into seasons

            print(f"  Collection: {collection_name}")        map_func = Code("""

            print(f"  Results: {info['count']:,}")            function() {

            print()                if (this.month && this.AverageTemperature) {

                            var season;

        # Save summary to JSON                    var month = this.month;

        summary_file = os.path.join(REPORTS_DIR, 'summary.json')                    

        summary_data = {                    if (month >= 3 && month <= 5) {

            'generated_at': datetime.now().isoformat(),                        season = "Spring";

            'total_collections': len(results_summary),                    } else if (month >= 6 && month <= 8) {

            'collections': results_summary                        season = "Summer";

        }                    } else if (month >= 9 && month <= 11) {

                                season = "Fall";

        with open(summary_file, 'w') as f:                    } else {

            json.dump(summary_data, f, indent=2)                        season = "Winter";

                            }

        print(f"✓ Summary saved to: summary.json")                    

                        emit(season, {

    def display_collection_stats(self):                        sum: this.AverageTemperature,

        """Display statistics about all collections"""                        count: 1

        print("\n" + "="*60)                    });

        print("DATABASE COLLECTIONS")                }

        print("="*60)            }

                """)

        collections = self.db.list_collection_names()        

                # Reduce function

        print(f"\nTotal collections: {len(collections)}\n")        reduce_func = Code("""

                    function(key, values) {

        # Categorize collections                var result = {sum: 0, count: 0};

        mr_colls = []                values.forEach(function(value) {

        data_colls = []                    result.sum += value.sum;

        other_colls = []                    result.count += value.count;

                        });

        for coll_name in collections:                return result;

            if coll_name in self.MR_COLLECTIONS:            }

                mr_colls.append(coll_name)        """)

            elif coll_name.endswith('_temps'):        

                data_colls.append(coll_name)        # Finalize function

            else:        finalize_func = Code("""

                other_colls.append(coll_name)            function(key, reducedValue) {

                        reducedValue.average = reducedValue.sum / reducedValue.count;

        # Display MapReduce collections                return reducedValue;

        if mr_colls:            }

            print("MapReduce Output Collections:")        """)

            for coll_name in mr_colls:        

                count = self.db[coll_name].count_documents({})        # Execute MapReduce

                print(f"  ✓ {coll_name:<30} {count:>8,} documents")        result = collection.map_reduce(

                    map_func,

        # Display data collections            reduce_func,

        if data_colls:            "seasonal_temps",

            print("\nData Collections:")            finalize=finalize_func

            for coll_name in data_colls:        )

                count = self.db[coll_name].count_documents({})        

                print(f"  • {coll_name:<30} {count:>8,} documents")        # Get results

                results = list(result.find())

        # Display other collections        

        if other_colls:        print(f"✓ MapReduce completed. Seasonal averages:")

            print("\nOther Collections:")        print(f"\n{'Season':<15} {'Avg Temp (°C)':<15} {'Records':<10}")

            for coll_name in other_colls:        print("-" * 45)

                count = self.db[coll_name].count_documents({})        

                print(f"  • {coll_name:<30} {count:>8,} documents")        season_order = ["Spring", "Summer", "Fall", "Winter"]

            for season in season_order:

    def close(self):            for doc in results:

        """Close MongoDB connection"""                if doc['_id'] == season:

        self.client.close()                    avg = doc['value']['average']

        print("\n✓ MongoDB connection closed")                    count = doc['value']['count']

                    print(f"{season:<15} {avg:<15.2f} {count:<10}")

        

def main():        # Save to file

    """Main execution function"""        self._save_results("seasonal_temps.json", results)

    fetcher = MapReduceResultsFetcher()        

            return results

    try:    

        # Display database stats    def mapreduce_city_temperature_ranking(self):

        fetcher.display_collection_stats()        """

                MapReduce: Rank major cities by average temperature

        # Fetch all MapReduce results        """

        fetcher.fetch_all_results()        print("\n" + "="*60)

                print("MapReduce #4: Major Cities Temperature Ranking")

        print("\n" + "="*60)        print("="*60)

        print("NEXT STEPS")        

        print("="*60)        collection = self.db[COLLECTIONS['major_city']]

        print("\n1. View JSON results in:")        

        print(f"   {REPORTS_DIR}")        if collection.count_documents({}) == 0:

        print("\n2. Generate visualizations:")            print("⚠ Major city collection is empty, skipping...")

        print("   python scripts/visualize_data.py")            return []

        print()        

                # Map function

        return 0        map_func = Code("""

    except KeyboardInterrupt:            function() {

        print("\n\n✗ Interrupted by user")                if (this.City && this.Country && this.AverageTemperature) {

        return 1                    var key = this.City + ", " + this.Country;

    finally:                    emit(key, {

        fetcher.close()                        sum: this.AverageTemperature,

                        count: 1,

                        min: this.AverageTemperature,

if __name__ == "__main__":                        max: this.AverageTemperature

    sys.exit(main())                    });

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
