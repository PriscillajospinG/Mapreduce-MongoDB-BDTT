// MapReduce: Seasonal temperature analysis

use climate_db;

print("\n" + "=".repeat(60));
print("MapReduce #3: Seasonal Temperature Analysis");
print("=".repeat(60) + "\n");

// Map function
var mapFunction = function() {
    if (this.month && this.AverageTemperature) {
        var season;
        var month = this.month;
        
        // Determine season (Northern Hemisphere)
        if (month >= 3 && month <= 5) {
            season = "Spring";
        } else if (month >= 6 && month <= 8) {
            season = "Summer";
        } else if (month >= 9 && month <= 11) {
            season = "Autumn";
        } else {
            season = "Winter";
        }
        
        emit(season, {
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
        out: "seasonal_analysis",
        finalize: finalizeFunction
    }
);

print("✓ MapReduce completed");
print("Results saved in collection: seasonal_analysis");

print("\nSeasonal averages:");
var seasons = ["Spring", "Summer", "Autumn", "Winter"];
seasons.forEach(function(season) {
    var doc = db.seasonal_analysis.findOne({_id: season});
    if (doc) {
        print("  " + season + ": " + doc.value.average.toFixed(2) + "°C (records: " + doc.value.count + ")");
    }
});
