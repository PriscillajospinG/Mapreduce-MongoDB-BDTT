// MapReduce: Average temperature by country

use climate_db;

print("\n" + "=".repeat(60));
print("MapReduce #1: Average Temperature by Country");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.AverageTemperature && this.Country) {
        emit(this.Country, {
            sum: parseFloat(this.AverageTemperature),
            count: 1,
            min: parseFloat(this.AverageTemperature),
            max: parseFloat(this.AverageTemperature)
        });
    }
};

// Reduce function
var reduceFunction = function(key, values) {
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
};

// Finalize function
var finalizeFunction = function(key, reducedValue) {
    reducedValue.average = reducedValue.sum / reducedValue.count;
    return reducedValue;
};

// Run MapReduce
db.country_temps.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "avg_temp_by_country",
        finalize: finalizeFunction
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: avg_temp_by_country");
print("Total countries: " + db.avg_temp_by_country.countDocuments());

print("\nTop 5 warmest countries:");
db.avg_temp_by_country.find().sort({"value.average": -1}).limit(5).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.average.toFixed(2) + "°C");
});

print("\nTop 5 coldest countries:");
db.avg_temp_by_country.find().sort({"value.average": 1}).limit(5).forEach(function(doc) {
    print("  " + doc._id + ": " + doc.value.average.toFixed(2) + "°C");
});
