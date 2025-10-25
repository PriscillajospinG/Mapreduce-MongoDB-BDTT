// MapReduce: Temperature by decade

use climate_db;

print("\n" + "=".repeat(60));
print("MapReduce #5: Temperature Analysis by Decade");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.year && this.AverageTemperature) {
        var decade = Math.floor(this.year / 10) * 10;
        emit(decade, {
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
        out: "decade_analysis",
        finalize: finalizeFunction
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: decade_analysis");
print("Total decades: " + db.decade_analysis.countDocuments());

print("\nDecade-wise temperature trends:");
db.decade_analysis.find().sort({_id: 1}).forEach(function(doc) {
    print("  " + doc._id + "s: Avg " + doc.value.average.toFixed(2) + "°C, Range " + doc.value.range.toFixed(2) + "°C");
});
