// MapReduce: Record count by country

use climate_db;

print("\n" + "=".repeat(60));
print("MapReduce #6: Record Count by Country");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.Country) {
        emit(this.Country, 1);
    }
};

// Reduce function
var reduceFunction = function(key, values) {
    return Array.sum(values);
};

// Run MapReduce
db.country_temps.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "records_by_country"
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: records_by_country");
print("Total countries: " + db.records_by_country.countDocuments());

print("\nTop 10 countries by record count:");
db.records_by_country.find().sort({value: -1}).limit(10).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.toLocaleString() + " records");
});
