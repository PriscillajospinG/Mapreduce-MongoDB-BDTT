// MapReduce: Temperature trends by year

var db = db.getSiblingDB('climate_db');

print("\n" + "=".repeat(60));
print("MapReduce #2: Temperature Trends by Year");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.year && this.AverageTemperature) {
        emit(this.year, {
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
    reducedValue.range = reducedValue.max - reducedValue.min;
    return reducedValue;
};

// Run MapReduce
db.country_temps.mapReduce(
    mapFunction,
    reduceFunction,
    {
        out: "temp_trends_by_year",
        finalize: finalizeFunction
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: temp_trends_by_year");
print("Total years: " + db.temp_trends_by_year.countDocuments());

print("\nSample - Recent years:");
db.temp_trends_by_year.find().sort({_id: -1}).limit(10).forEach(function(doc) {
    print("  Year " + doc._id + ": Avg " + doc.value.average.toFixed(2) + "°C, Range " + doc.value.range.toFixed(2) + "°C");
});
